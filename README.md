# 9th Seed

A twitch bot designed to assist viewers of the [St Louis Vintage Rotisserie Draft](https://twitch.tv/stlvrd)

## Commands


# Docker setup

## Requirements

You will need `docker desktop` installed.

## Starting

To run the environment hosted on docker, run the following:

```
docker-compose build
docker-compose up
```



# Non-Docker setup

## Requirements

You will need `yarn` and `mysql` installed.

You will need a database called `stlvrd` created in mysql which is accessibly by your user.

## Populating the Database

To get data into the database (which assists or is required for many of the features of 9th Seed, run

```
yarn db
```

## Starting

Populate a `creds` folder with a `dbCreds.json` and a `twitchCreds.json`.

Example `dbCreds.json`:
```
{
  "connectionLimit": 10,
  "database": "stlvrd",
  "host": "localhost",
  "password": "YOUR_PASSWORD_HERE",
  "user": "YOUR_USER_HERE"
}
```

Example `twitchCreds.json`:
```
{
  "username": "YOUR_USER_HERE"
  "password": "oauth:YOUR_OAUTH_HERE",
}
```

Run the following to start your bot watching the channel.
```
yarn
yarn start
```


## Code Quality

This project uses [Mocha](https://mochajs.org/) tests and [ESLint](eslint.org) to help ensure that it keeps working.
