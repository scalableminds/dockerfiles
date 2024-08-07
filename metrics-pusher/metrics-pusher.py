#!/bin/python3

import requests
import time
import multiprocessing
import os
import traceback
import urllib.parse


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


if __name__ == "__main__":
    name = os.environ.get("INSTANCE_NAME")
    pushgateway_url = os.environ.get("PUSHGATEWAY_URL")
    scrape_interval = int(os.getenv("SCRAPE_INTERVAL", "60"))
    auth_user = os.environ.get("AUTH_USER")
    auth_pass = os.environ.get("AUTH_PASSWORD")
    urls = os.environ.get("ENDPOINTS")

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

    for p in processes:
        p.join()
        print("warning:", p.name, "closed")
