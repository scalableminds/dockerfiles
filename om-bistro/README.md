# Schraders Bistro openmensa parser

This is an openmensa parser for [Schraders Bistro](https://ein-anderes-mahl.de/bistro-babelsberg/).

To run it locally, follow these steps:
1. Install dependencies (in a virtual env) with `pip install -r requirements.txt`
2. Run the server with `python -m flask --app openmensa_server run`
3. Navigate to `localhost:5000/feed`

You can also run the docker container locally:

```shell
docker build -t openmensa-schrader .
docker run -p 5000:5000 openmensa-schrader
```
