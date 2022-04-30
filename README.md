# About

The `docker-registry-frontend` is a browser-based solution for browsing and modifying a private Docker registry.

# Features

For a list of all the features, please see the [Wiki](https://github.com/QuentiumYT/Docker-Registry-Web/wiki/Features). Note, that currently the Wiki pages still refer to version 1 of this frontend.

# Development

To learn how to develop for the docker-registry-frontend, see [here](develop/README.md).

# Private / local usage

For a private usage, change the config and execute the following commands:

### Pre installation for local usage

Add `172.200.0.2 registry.loc` to your `/etc/hosts`

Run `bash setup_local.sh`, it will:

- Change the config for a local installation on your machine
- Add Registry IPs to docker insecure login list

### docker-compose.yml changes for hosted website

Change `ENV_REGISTRY_PROXY_FQDN` and `ENV_REGISTRY_PROXY_PORT` env variables

Uncomment `ENV_USE_SSL` and `ENV_DOCKER_REGISTRY_USE_SSL` if SSL is needed (recommended)

### Shell commands

```bash
# Add the global user (Bcrypt is the only password that is supported for authentication)
htpasswd -Bc config/htpasswd root
# Run the container
docker-compose up -d
# Login to the registry with the public IP
docker login <PROXY_FQDN>:5005
# or local usage
docker login registry.loc

# Push an image with a specific tag
docker tag debian:bullseye <PROXY_FQDN>:5005/<image_name>:<tag>
docker push <PROXY_FQDN>:5005/<image_name>:<tag>
# or local usage
docker tag debian:bullseye registry.loc/<image_name>:<tag>
docker push registry.loc/<image_name>:<tag>
```

# Usage

This application is available in the form of a Docker image that you can run as a container by executing this command:

```bash
sudo docker run \
  -d \
  -e ENV_DOCKER_REGISTRY_HOST=ENTER-YOUR-REGISTRY-HOST-HERE \
  -e ENV_DOCKER_REGISTRY_PORT=ENTER-PORT-TO-YOUR-REGISTRY-HOST-HERE \
  -p 8080:80 \
  quentin/docker-registry-frontend
```

This command starts the container and forwards the container's private port `80` to your host's port `8080`. Make sure you specify the correct url to your registry.

When the application runs you can open your browser and navigate to http://localhost:8080.

## Docker registry using SSL encryption

If the Docker registry is only reachable via HTTPs (e.g. if it sits behind a proxy) , you can run the following command:

```bash
sudo docker run \
  -d \
  -e ENV_DOCKER_REGISTRY_HOST=ENTER-YOUR-REGISTRY-HOST-HERE \
  -e ENV_DOCKER_REGISTRY_PORT=ENTER-PORT-TO-YOUR-REGISTRY-HOST-HERE \
  -e ENV_DOCKER_REGISTRY_USE_SSL=1 \
  -p 8080:80 \
  quentin/docker-registry-frontend
```

## SSL encryption

If you want to run the application with SSL enabled, you can do the following:

```bash
sudo docker run \
  -d \
  -e ENV_DOCKER_REGISTRY_HOST=ENTER-YOUR-REGISTRY-HOST-HERE \
  -e ENV_DOCKER_REGISTRY_PORT=ENTER-PORT-TO-YOUR-REGISTRY-HOST-HERE \
  -e ENV_DOCKER_REGISTRY_USE_SSL=1 \
  -e ENV_USE_SSL=yes \
  -v $PWD/path_to_local_cert.crt:/certs/registry.crt:ro \
  -v $PWD/path_to_local_cert.key:/certs/registry.key:ro \
  -p 443:443 \
  quentin/docker-registry-frontend
```

Note that the application still serves the port `80` but it is simply not exposed ;). Enable it at your own will. When the application runs with SSL you can open your browser and navigate to https://localhost.

## Use the application as the registry

If you are running the Docker registry on the same host as the application but only accessible to the application (eg. listening on `127.0.0.1`) then you can use the application as the registry itself.

Normally this would then give bad advice on how to access a tag:

```bash
docker pull localhost:5000/yourname/imagename:latest
```

We can override what hostname and port to put here:

```bash
sudo docker run \
 -d \
 -e ENV_DOCKER_REGISTRY_HOST=localhost \
 -e ENV_DOCKER_REGISTRY_PORT=5000 \
 -e ENV_REGISTRY_PROXY_FQDN=ENTER-YOUR-APPLICATION-HOST-HERE \
 -e ENV_REGISTRY_PROXY_PORT=ENTER-PORT-TO-YOUR-APPLICATION-HOST-HERE \
 -e ENV_USE_SSL=yes \
 -v $PWD/server.crt:/certs/registry.crt:ro \
 -v $PWD/server.key:/certs/registry.key:ro \
 -p 443:443 \
 registry
```

A value of `80` or `443` for `ENV_REGISTRY_PROXY_PORT` will not actually be shown as Docker will check `443` and then `80` by default.

## Kerberos authentication

If you want to use Kerberos to protect access to the registry frontend, you can
do the following:

```bash
sudo docker run \
  -d \
  -e ENV_DOCKER_REGISTRY_HOST=ENTER-YOUR-REGISTRY-HOST-HERE \
  -e ENV_DOCKER_REGISTRY_PORT=ENTER-PORT-TO-YOUR-REGISTRY-HOST-HERE \
  -e ENV_AUTH_USE_KERBEROS=yes \
  -e ENV_AUTH_NAME="Kerberos login" \
  -e ENV_AUTH_KRB5_KEYTAB=/etc/apache2/krb5.keytab \
  -v $PWD/krb5.keytab:/etc/apache2/krb5.keytab:ro \
  -e ENV_AUTH_KRB_REALMS="ENTER.YOUR.REALMS.HERE" \
  -e ENV_AUTH_KRB_SERVICE_NAME=HTTP \
  -p 80:80 \
  registry
```

You can of course combine SSL and Kerberos.

# Browse mode

If you want to start application with browse mode which means no repos/tags management feature in the UI, You can specify `ENV_MODE_BROWSE_ONLY` flag as follows:

```bash
sudo docker run \
  -d \
  -e ENV_DOCKER_REGISTRY_HOST=ENTER-YOUR-REGISTRY-HOST-HERE \
  -e ENV_DOCKER_REGISTRY_PORT=ENTER-PORT-TO-YOUR-REGISTRY-HOST-HERE \
  -e ENV_MODE_BROWSE_ONLY=true \
  -p 8080:80 \
  registry
```

You can set `true` or `false` to this flag.

**NOTE** For now `ENV_MODE_BROWSE_ONLY` will be overwritten to `true`.

# Default repositories per page

By default 10 repositories will be listed per page. To adjust this number, to
let's say 50 pass `-e ENV_DEFAULT_REPOSITORIES_PER_PAGE=50` to your `docker run`
command.

# Default tags per page

By default 10 tags will be listed per page. To adjust this number, to
let's say 5 pass `-e ENV_DEFAULT_TAGS_PER_PAGE=5` to your `docker run`
command. Note that providing a big number will result in a heavy load on browsers.

# Contributions are welcome!

If you like the application, I invite you to contribute and report bugs or feature request on the project's github page: https://github.com/QuentiumYT/Docker-Registry-Web/issues.
To learn how to develop for the docker-registry-frontend, see [here](develop/README.md).

Thank you for your interest!
