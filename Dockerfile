FROM ubuntu:22.04

# MAINTAINER Owen Crandall <ocrandall@ftidc.com>

RUN apt-get -yqq update
RUN apt-get -yqq install -yq nodejs

WORKDIR /app
COPY . .
