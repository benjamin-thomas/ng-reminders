## Setup

1. Setup env vars

`./manage/dev/init/*`

Then follow the given instructions.

2. Setup dev reverse proxy (handles TLS)

- `cd ./nginx_dev`
- `./create_fake_certs`

3. Launch the nginx reverse proxy

`./manage/dev/run`

4. Access the app's containers

#### Web container

- `curl 127.0.0.6:8080/ping`
- `curl api.reminders.test:8080/ping`

#### Reverse proxy (update /etc/hosts accordingly)

- `curl --insecure https://127.0.0.7/ping`
- `curl --cacert ./nginx_dev/cert.pem https://api-proxy.reminders.test/ping`

#### Access the web app's logger

`docker logs golang-gin_web_1 -f`

#### Use this httpie helper (handles TLS + session, etc.)

`./manage/dev/http -p /ping`
