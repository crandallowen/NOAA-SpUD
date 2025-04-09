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
COPY idp_cert.pem .
COPY sp_cert.pem .
COPY private-key.key .

RUN npm run build

ENV NODE_ENV=production
ENV DB_USER=postgres
ENV DB_HOST=spud-1.cduw4y6qos2l.us-east-1.rds.amazonaws.com
ENV PORT=80

EXPOSE 80
CMD ["node", "server.js"]