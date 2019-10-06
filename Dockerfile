# credits https://github.com/Ilhicas/nginx-letsencrypt
# https://ilhicas.com/2019/03/02/Nginx-Letsencrypt-Docker.html

FROM node:8.16-alpine
#nginx setup
RUN apk update \
 && apk add nginx inotify-tools certbot openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && rm /var/cache/apk/* 
WORKDIR /opt
COPY docker/entrypoint.sh entrypoint.sh 
COPY docker/certbot.sh certbot.sh
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/ssl-options/ /etc/ssl-options
RUN chmod +x entrypoint.sh  && \
    chmod +x certbot.sh 
RUN mkdir -p /run/nginx

#app setup
RUN mkdir /opt/app
WORKDIR /opt/app
COPY package.json .
COPY yarn.lock .
COPY dist .
RUN yarn install --production
WORKDIR /opt
ENTRYPOINT ["./entrypoint.sh"]