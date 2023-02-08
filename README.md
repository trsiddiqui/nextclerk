

```
1. yarn
2. openssl enc -d -aes-256-cbc -pbkdf2 -in .env.development.local.enc -out .env.development.local -pass YOUR_PASSWORD_ASK_TAHA
3. docker-compose up
4. yarn db-prepare
5. yarn dev
```

.env files are encoded using `openssl enc -aes-256-cbc -pbkdf2 -in .env.development.local -out .env.development.local.enc` with a 13 character alphnumeric+special characters password.
