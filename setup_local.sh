#!/bin/bash

sudo cp config/daemon.json /etc/docker/
sudo service docker restart

mv config/config.yml config/config_host.yml
cp config/config_local.yml config/config.yml
