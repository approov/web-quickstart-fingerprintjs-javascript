FROM nginx:alpine

ARG APPROOV_SITE_KEY
ARG FINGERPRINTJS_BROWSER_TOKEN

ADD ./nginx/nginx-behind-traefik.conf /etc/nginx/nginx.conf

ADD ./shapes-app /usr/share/nginx/html

RUN \
    sed -i s/___APPROOV_SITE_KEY___/${APPROOV_SITE_KEY}/ /usr/share/nginx/html/assets/js/app.js && \
    sed -i s/___APPROOV_ATTESTER_URL___/${APPROOV_ATTESTER_URL}/ /usr/share/nginx/html/assets/js/app.js && \
    sed -i s/___FINGERPRINTJS_BROWSER_TOKEN___/${FINGERPRINTJS_BROWSER_TOKEN}/ /usr/share/nginx/html/assets/js/app.js
