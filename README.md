# Notes on development
Generating certificates ( https://medium.com/@niktrix/self-signed-certificate-in-macos-sierra-3580dcd06693 ):
```
openssl req -x509 -nodes -sha256 -days 10000 -newkey rsa:2048 -keyout key.pem -out certificate.pem
```

for mac, you can also add it to keychain:

```
sudo security add-trusted-cert -d -r trustAsRoot -k /Library/Keychains/System.keychain certificate.pem
```
