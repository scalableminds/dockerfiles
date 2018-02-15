# cronut

Docker image for [cronut](https://github.com/harrystech/cronut).

![Docker Hub Badge](http://dockeri.co/image/scalableminds/cronut)

This currently uses sqlite to simplify the setup.

## Usage:
```
docker run -ti --rm -p 3000:80 -e SECRET_KEY_BASE=<something secure> cronut
```

Go to [localhost:3000](http://localhost:3000), add a job.
Note the `Ping ID` of the job.

To ping cronut for this job, send a post request:
```
curl --header "X-CRONUT-API-TOKEN: token" -X POST -F "public_id=$(date +%s)-<Ping ID>" localhost:3000/ping
```

## API:
You can set those environment variables:

|env var                |default      |
|---                    |---          |
|`SECRET_KEY_BASE`      |:warning:    |
|`TOKEN`                |token        |
|`PORT`                 |80           |
|`RAILS_ENV`            |production   |
|`CRONUT_BASE_TIME_ZONE`|Europe/Berlin|

To change the system timezone, check the commands used in the Dockerfile.
