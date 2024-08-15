# Metric Pusher

## Usage

Run using docker:

```sh
docker run --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /proc:/host/proc:ro \
    -e INSTANCE_NAME="foo" \
    -e PUSHGATEWAY_URL="https://<domain>/path/to/pushgateway" \
    -e SCRAPE_INTERVAL=60 \
    -e AUTH_USER="<user>" \
    -e AUTH_PASSWORD="<password>" \
    -e ENDPOINTS="http://<domain1>/metrics,http://<domain2>/metrics" \
    -e HOST_PROC_PATH="/host/proc" \
    scalableminds/metrics-pusher
```

This will scrape all specified endpoints and containers using the internal [Container Exporter](#container-exporter).

## Configuration

Environment Variables:

| Name | Description |
|------|-------------|
| `INSTANCE_NAME` | Job name used for pushing metrics |
| `PUSHGATEWAY_URL` | URL to push metrics to (e.g. `https://<domain>/path/to/pushgateway`) |
| `SCRAPE_INTERVAL` | Scrape interval in seconds. Default to 60. |
| `AUTH_USER` | User for Basic Auth |
| `AUTH_PASSWORD` | Password for Basic Auth |
| `ENDPOINTS` | Comma separated list of URLs. Each endpoint will be scraped once per interval. Allows at most one URL per hostname (e.g. `http://node_exporter:9100/metrics`) |
| `HOST_PROC_PATH` | Path to the mounted `/proc` directory |
| `DOCKER_HOST` | Path to docker socket. Defaults to `unix:///var/run/docker.sock` |

## Container Exporter

In addition to scraping multiple endpoints, this script also scrapes the container performance metrics.
Therefore, following metrics are generated:

- `system_cpu_total` All system jiffies spend, including idle.
- `container_cpu_user` Number of jiffies a container spend in user mode. 
- `container_cpu_kernel` Number of jiffies a container spend in kernel mode. 
- `container_memory_used` Number of Memory pages allocated to this container. 
- `container_number_processes` Number of processes running inside a container.
- `container_number_threads` Number of threads created by the processes.
- `container_disk_read` Number of bytes read from disk.
- `container_disk_write` Number of bytes written to disk.

All metrics will be aggregated over all processes running inside a container.
In case a container is restarted these metrics reset to 0.
