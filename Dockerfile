FROM node:current-alpine

# MAINTAINER Owen Crandall <ocrandall@ftidc.com>

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src ./src
COPY jsconfig.json .
COPY LICENSE .
COPY nodemon.json .
COPY vite.config.js .
COPY server.js .
COPY rds-ca-cert.pem .

RUN npm run build



EXPOSE 7007
CMD ["node", "server.js"]