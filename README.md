

```
1. yarn
2. openssl enc -d -pbkdf2 -pass pass:YOUR_PASSWORD_ASK_TAHA -in .env.development.local.enc -out .env.development.local
3. docker-compose up
4. yarn db-prepare
5. yarn dev
```

.env files are encoded using `openssl enc -pbkdf2 -in .env.development.local -out .env.development.local.enc` with a 13 character alphnumeric+special characters password.
