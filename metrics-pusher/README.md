# Metric Pusher

## Usage

Run using docker:

```sh
docker run -v /var/run/docker.sock:/var/run/docker.sock \
    -e INSTANCE_NAME="foo" \
    -e PUSHGATEWAY_URL="https://<domain>/path/to/pushgateway" \
    -e SCRAPE_INTERVAL=60 \
    -e AUTH_USER="<user>" \
    -e AUTH_PASSWORD="<password>" \
    -e ENDPOINTS="http://<domain1>/metrics,http://<domain2>/metrics" \
    scalableminds/metrics-pusher
```

This will scrape all specified endpoints.

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

