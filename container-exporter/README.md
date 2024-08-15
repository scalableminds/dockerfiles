# Container Exporter

A small python script to monitor all running docker container.

This script provides the following metrics:

- `system_cpu_total` All system jiffies spend, including idle.
- `container_cpu_user` Number of jiffies a container spend in user mode. 
- `container_cpu_kernel` Number of jiffies a container spend in kernel mode. 
- `container_memory_used` Number of Memory pages allocated to this container. 
- `container_number_processes` Number of processes running inside a container.
- `container_number_threads` Number of threads created by the processes.
- `container_disk_read` Number of bytes read from disk.
- `container_disk_write` Number of bytes written to disk.

All metrics will be aggregated over all processes running inside a container.
In case a container is restarted these metrics reset to 0, but `system_cpu_total`.

## Usage

To start this program using docker run the following command:

```sh
docker run \
    --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /proc:/host/proc:ro \
    -e PROC_HOST=/host/proc \
    -e DOCKER_HOST=/var/run/docker.sock \
    -e SCRAPE_INTERVAL=60 \
    scalableminds/container-exporter
```

All metrics will be provided at `http://<host>:9101/`.

## Configuration

Environment Variables:

| Name | Description |
|------|-------------|
| `PROC_HOST` | Path to the mounted `/proc` directory |
| `DOCKER_HOST` | Path to docker socket. Defaults to `/var/run/docker.sock` |
| `SCRAPE_INTERVAL` | Scrape interval in seconds. Default to 60. |
