FROM node:16-alpine

USER root

# The node image removes these packages as they are only needed to build node not to run it
# Since we update npm package at start up will need these in the image
RUN apk add --no-cache \
    bash \
    curl \
    gcc \
    g++ \
    git \
    make \
    nano \
    python3

############################################################
# Setup environment variables
############################################################

ENV SOURCE_DIR /source
ENV START_SCRIPT /root/start-develop.sh

# Let people know how this was built
ADD Dockerfile /root/Dockerfile

# Exposed ports (only the webpack port 9000)
EXPOSE 9000

VOLUME ["/source"]

CMD $START_SCRIPT
