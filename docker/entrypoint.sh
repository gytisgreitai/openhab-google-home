#!/bin/sh
# Create a self signed default certificate, so Ngix can start before we have
# any real certificates.

#Ensure we have folders available

if [ ! -f /usr/share/nginx/certificates/fullchain.pem ]
then
    echo "no certs found, creating temporary ones"
    mkdir -p /usr/share/nginx/certificates
    openssl genrsa -out /usr/share/nginx/certificates/privkey.pem 4096
    openssl genrsa -out /usr/share/nginx/certificates/privkey.pem 4096
    openssl req -new -key /usr/share/nginx/certificates/privkey.pem -out /usr/share/nginx/certificates/cert.csr -nodes -subj \
    "/C=PT/ST=World/L=World/O=${DOMAIN}/OU=Fiercely lda/CN=${DOMAIN}/EMAIL=${EMAIL}"
    openssl x509 -req -days 365 -in /usr/share/nginx/certificates/cert.csr -signkey /usr/share/nginx/certificates/privkey.pem -out /usr/share/nginx/certificates/fullchain.pem
fi

nohup node --harmony-async-iteration /opt/app/index.js > /var/log/app.log &

if [ -z "$DISABLE_LETS_ENCRYPT" ]
then
    ### Send certbot Emission/Renewal to background
    $(while :; do /opt/certbot.sh; sleep "${RENEW_INTERVAL:-12h}"; done;) &
fi

### Check for changes in the certificate (i.e renewals or first start)
$(while inotifywait -e close_write /usr/share/nginx/certificates; do nginx -s reload; done) &

nginx -g "daemon off;"