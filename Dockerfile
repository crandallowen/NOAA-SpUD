FROM python:3.10-slim AS python-build

# MAINTAINER Owen Crandall <ocrandall@ftidc.com>

RUN apt-get update -y \
    && apt-get upgrade -y \
    && apt-get install -y libpq-dev build-essential\
    && apt-get clean

WORKDIR /app
RUN pip install --upgrade pip
RUN pip install spud_io
RUN pip install pyinstaller

COPY upload.py .
RUN pyinstaller --onefile upload.py

FROM node:slim

WORKDIR /app

COPY src ./src
COPY .env* .
COPY idp_cert.pem .
COPY private-key.key .
COPY rds-ca-cert.pem .
COPY sp_cert.pem .
COPY package*.json .
COPY server.js .
COPY vite.config.js .
COPY --from=python-build /app/dist/upload .
RUN npm install
RUN npm run build

EXPOSE 80
ENTRYPOINT ["./node_modules/.bin/dotenvx", "run"]
CMD ["--env-file", ".env.production", "--", "node", "server.js"]