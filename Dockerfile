FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD [ "node", "main.js" ]

LABEL traefik.enable="true"
LABEL traefik.http.routers.signal.rule="Host(`signal.bttchr.com`)"
LABEL traefik.http.routers.signal.entrypoints="websecure"
LABEL traefik.http.routers.signal.tls.certresolver="letsencrypt"
