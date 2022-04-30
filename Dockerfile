################################################################################
# Stage 1: Build the Angluar application
################################################################################
FROM node:16-alpine as build_app

ENV WORKDIR=/usr/src
RUN mkdir -p $WORKDIR \
    $WORKDIR/.git

WORKDIR $WORKDIR
COPY . $WORKDIR

# Add some git files for versioning
ADD .git/HEAD $WORKDIR/.git/HEAD
ADD .git/refs $WORKDIR/.git/refs

# Create version file
RUN export GITREF=$(cat .git/HEAD | cut -d" " -f2) && \
    export GITSHA1=$(cat .git/$GITREF) && \
    echo "{\"git\": {\"sha1\": \"$GITSHA1\", \"ref\": \"$GITREF\"}}" > app/app-version.json

# Install dependencies
RUN npm install
# Build App
RUN npm run build

################################################################################
# Stage 2: Run the Angular application
################################################################################

FROM debian:bullseye

USER root

# Setup environment variables
ENV WWW_DIR /var/www/html
ENV START_SCRIPT /root/start-apache.sh

RUN mkdir -pv $WWW_DIR

# Speedup DPKG and don't use cache for packages
# Taken from here: https://unix.stackexchange.com/questions/7238/how-to-make-dpkg-faster
RUN echo "force-unsafe-io" > /etc/dpkg/dpkg.cfg.d/force-unsafe-io
RUN echo "Acquire::http {No-Cache=True;};" > /etc/apt/apt.conf.d/no-cache
RUN echo "Acquire::Languages 'none';" > /etc/apt/apt.conf.d/no-lang

# Copy app with installed packages in www directory
COPY --from=build_app /usr/src/dist/ $WWW_DIR/

# Install and configure webserver software
RUN apt-get -y update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y --no-install-recommends \
    wget \
    apache2 \
    apache2-utils

# Install kerberos auth the hard way (not in bullseye anymore)
RUN wget http://ftp.fr.debian.org/debian/pool/main/liba/libapache-mod-auth-kerb/libapache2-mod-auth-kerb_5.4-2.5_amd64.deb && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y ./libapache2-mod-auth-kerb_5.4-2.5_amd64.deb && \
    rm libapache2-mod-auth-kerb_5.4-2.5_amd64.deb

RUN a2enmod proxy && \
    a2enmod proxy_http

RUN apt-get -y autoremove && \
    apt-get -y clean && \
    rm -rf /var/lib/apt/lists/*

# Add and enable the apache site and disable all other sites
RUN a2dissite 000*
ADD config/apache-site.conf /etc/apache2/sites-available/docker-site.conf
RUN a2ensite docker-site.conf

ADD start-apache.sh $START_SCRIPT
RUN chmod +x $START_SCRIPT

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2

# Expose 80, 443 ports
EXPOSE 80 443

CMD $START_SCRIPT
