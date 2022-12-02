FROM nginx:alpine

ARG APPROOV_SITE_KEY
ARG FINGERPRINT_BROWSER_TOKEN

ADD ./nginx/nginx-behind-traefik.conf /etc/nginx/nginx.conf
ADD ./nginx/conf.d/prod.conf /etc/nginx/conf.d/default.conf

ADD ./shapes-app /usr/share/nginx/html

RUN \
    sed -i s/___APPROOV_SITE_KEY___/${APPROOV_SITE_KEY}/ /usr/share/nginx/html/config.js && \
    sed -i s/___FINGERPRINT_BROWSER_TOKEN___/${FINGERPRINT_BROWSER_TOKEN}/ /usr/share/nginx/html/config.js
