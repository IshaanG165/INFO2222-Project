#!/bin/bash
mkdir -p certs
cd certs
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 365 -key ca.key -out ca.crt -subj "/C=AU/ST=NSW/O=SyncSpace-CA/CN=localhost"
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -subj "/C=AU/ST=NSW/O=SyncSpace/CN=localhost"
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
echo "✅ Certs generated in ./certs/"
