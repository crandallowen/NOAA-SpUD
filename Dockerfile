FROM node:slim

# MAINTAINER Owen Crandall <ocrandall@ftidc.com>

RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y wget build-essential checkinstall libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev libffi-dev zlib1g-dev && \
    apt-get clean
RUN cd /usr/src && \
    wget https://www.python.org/ftp/python/3.10.9/Python-3.10.9.tgz && \
    tar xzf Python-3.10.9.tgz && \
    cd Python-3.10.9 && \
    ./configure --enable-optimizations && \
    make install

WORKDIR /app
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

COPY ./SpUD/dist/spud-0.0.1-py3-none-any.whl .
RUN pip install spud-0.0.1-py3-none-any.whl

COPY package*.json ./

RUN npm install

COPY src ./src
COPY jsconfig.json .
COPY LICENSE .
COPY nodemon.json .
COPY vite.config.js .
COPY server.js .
COPY rds-ca-cert.pem .
COPY idp_cert.pem .
COPY sp_cert.pem .
COPY private-key.key .

RUN npm run build

EXPOSE 80
CMD ["node", "server.js"]