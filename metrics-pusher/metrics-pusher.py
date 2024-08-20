#!/bin/python3

import requests
import time
import multiprocessing
import os
import traceback
import urllib.parse
import prometheus_client


def push_metrics(
    name, pushgateway_url, endpoint_name, endpoint_url, scrape_interval, user, password
):
    print(f"({endpoint_name}) starting collector")
    metrics_session = requests.Session()
    session = requests.Session()
    if user is not None and password is not None:
        session.auth = (user, password)
    while True:
        interval_offset = int(time.time()) % scrape_interval
        interval_time_left = scrape_interval - interval_offset
        time.sleep(interval_time_left)

        try:
            interval_offset = int(time.time()) % scrape_interval
            print(
                f"({endpoint_name}) collecting metrics from: {endpoint_url} [{interval_offset}s]"
            )

            resp = metrics_session.get(endpoint_url)
            if resp.status_code != 200:
                print(
                    f"({endpoint_name}) failed to collect metrics [status_code={resp.status_code}]"
                )
                continue
            metrics = resp.content

            job_url = f"{pushgateway_url}/metrics/job/{name}.{endpoint_name}"
            interval_offset = int(time.time()) % scrape_interval
            print(f"({endpoint_name}) put metrics to: {job_url} [{interval_offset}s]")

            resp = session.put(job_url, data=metrics)

            interval_offset = int(time.time()) % scrape_interval
            if resp.status_code == 200:
                print(f"({endpoint_name}) done [{interval_offset}s]")
            else:
                print(resp.text)
                print(
                    f"({endpoint_name}) push failed [status_code={resp.status_code}] [{interval_offset}s]"
                )
        except Exception as e:
            traceback.print_exception(e)
        except KeyboardInterrupt:
            break


def push_container_metrics(
    name, pushgateway_url, proc_path, interval, username, password
):
    print("(container) starting exporter")
    import monitor

    def auth_handler(url, method, timeout, headers, data):
        from prometheus_client.exposition import basic_auth_handler

        return basic_auth_handler(
            url, method, timeout, headers, data, username, password
        )

    while True:
        time_until_next_fetch = interval - (time.time() % interval)
        time.sleep(time_until_next_fetch)

        try:
            monitor.scrape(proc_path)
            prometheus_client.push_to_gateway(
                pushgateway_url,
                job=f"{name}.container",
                handler=auth_handler,
                registry=monitor.registry,
            )
        except Exception as e:
            traceback.print_exception(e)
        except KeyboardInterrupt:
            break


if __name__ == "__main__":
    name = os.environ.get("INSTANCE_NAME")
    pushgateway_url = os.environ.get("PUSHGATEWAY_URL")
    scrape_interval = int(os.getenv("SCRAPE_INTERVAL", "60"))
    auth_user = os.environ.get("AUTH_USER")
    auth_pass = os.environ.get("AUTH_PASSWORD")
    urls = os.environ.get("ENDPOINTS")
    proc_path = os.environ.get("HOST_PROC_PATH", "/host/proc")

    if name is None or name == "":
        print("No INSTANCE_NAME provided")
        exit(1)
    if pushgateway_url is None:
        print("No PUSHGATEWAY_URL provided")
        exit(1)
    if urls is None:
        print("No ENDPOINTS configured. Use a comma seperated list of URLs.")

    endpoints = {}
    for url in urls.split(","):
        u = urllib.parse.urlparse(url)
        endpoints[u.hostname] = url

    print(f"{name=}")
    print(f"{pushgateway_url=}")
    print(f"{scrape_interval=}")
    print(f"{endpoints=}")
    print(f"{endpoints.items()}")

    queue = multiprocessing.Queue()
    processes = []
    for endpoint_name, endpoint in endpoints.items():
        p = multiprocessing.Process(
            target=push_metrics,
            name=endpoint_name,
            args=(
                name,
                pushgateway_url,
                endpoint_name,
                endpoint,
                scrape_interval,
                auth_user,
                auth_pass,
            ),
        )
        p.start()
        processes.append(p)

    push_container_metrics(
        name,
        pushgateway_url,
        proc_path,
        scrape_interval,
        auth_user,
        auth_pass,
    )

    for p in processes:
        p.join()
        print("warning:", p.name, "closed")
