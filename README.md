# nest-api <img href="https://github.com/mqxewww/nest-api" src="https://nestjs.com/img/logo-small.svg" width="80px" alt="Nest logo" align="right">

## Description :pencil2:

NestJS API where I try everything that comes to mind.

## Setup

- In `./config`, copy `.env.example` to `.env` and fill in the values
- Generate RSA keys and place them in `./config`, must be named `private_key.pem` and `public_key.pem`
- Run the following commands:

```
npm i
npm run docker:init
npm run mikro-orm-schema-update
```

## Features :sparkles:

- [x] Password hashing with bcrypt
- [x] Seeders with @mikro-orm/seeder
- [x] Documentation with @nestjs/swagger
- [x] Clean headers with helmet, rate limiting with @nestjs/throttler
- [x] Logging with nestjs-pino and pino-pretty
- [x] Authentication with @nestjs/jwt using RSA keys, guard and public decorator
- [x] Image streaming and upload for avatars

~ mqxewww, 2023
