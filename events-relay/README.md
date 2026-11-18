# events-relay

Relays WEBKNOSSOS analytics events to Amplitude and logs them to gzipped files.

Clients `POST` Amplitude HTTP API payloads to `/events`. All events of a request must share the same `webknossos_uri` user property. The events are appended to a log file in `LOG_DIR` (rotated daily) and forwarded to Amplitude. `/health` returns `Ok`.

## Configuration

Environment variables:

- `AMPLITUDE_TARGET` (optional, default `https://api2.amplitude.com/2/httpapi`)
- `LOG_DIR` (optional, default `./logs`, must exist)
- `WELL_KNOWN_URIS_FILE` (optional, default `./well-known-uris.htpasswd`; if set explicitly, the file must exist)
- `PORT` (optional, default `3000`)

## Well-known URIs

The htpasswd file maps the hostname of a `webknossos_uri` to its Amplitude API key. Requests for a listed hostname are rejected with `401` unless their `api_key` matches. Hostnames that aren't listed are relayed without a check. Hostnames are matched case-insensitively. Scheme, port, path and a trailing dot are ignored. The file is read at startup, so restart after changing it.

```
htpasswd -nbB webknossos.example.com <apiKey> >> well-known-uris.htpasswd
```

Supported hashes are bcrypt (`-B`, recommended), `{SHA}` (`-s`) and plain text (`-p`). MD5 and crypt are not supported.

## Usage

```
docker run \
  -v "...:/app/logs" \
  -v ".../well-known-uris.htpasswd:/app/well-known-uris.htpasswd:ro" \
  -p 3000:3000 \
  scalableminds/events-relay
```
