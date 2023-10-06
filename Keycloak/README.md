For AWS
Install docker
Copy docker-compose for production
copy sql and Keycloak directions

generate ssl cert with teh following

```cmd
cd Keycloak

openssl req -newkey rsa:2048 -nodes \
  -keyout server.key.pem -x509 -days 3650 -out server.crt.pem

chmod 755 server.key.pem


```
