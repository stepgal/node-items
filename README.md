#node-items API

## Getting Started

### Documentation

Documentation will be served at `/swagger` [API Docs](http://ec2-3-15-18-44.us-east-2.compute.amazonaws.com:3002/swagger). It is suggested to check it if you want to execute any request since it contains a **Try Out** option, which is much more comfortable than using other tools such as Postman.

### Installing node

Get the latest version of node from the [official website](https://nodejs.org/).

Install dependencies by running `npm i`.

### Database configuration

MongoDB hosted on mongodb://13.59.96.104:27017/auth

Elasticsearch hosted on http://18.222.24.29:9200

### Starting app

We have two ways to start the app. To start it in production mode run `npm start` in the root path of the project. To start it run `node start server.js`. Then access the app at **localhost:3002**. The port is logged in the console where you run the start script.  
Also, you can start the app in production mode using [docker-compose](https://docs.docker.com/compose/install/). You just have to run `docker-compose up`.

## Development

### Environments

By default, the environment will be **development**, but you can easily change it using the **NODE_ENV** environmental variable.

### Environment variables

[Dotenv](https://www.npmjs.com/package/dotenv) is used for managing environment variables. They are stored in the `/.env` file. Take into account that the variables defined in the `bashrc` are not overrided.

The environment variables should be added to the `.env` file in the form of `NAME=VALUE`, as the following example:

```
NODE_ENV=DEVELOPMENT
SERVER_PORT=3002

# Main Mongo DB
MONGO_DB_MAIN_HOST=mongodb://13.59.96.104:27017/auth
MONGO_DB_MAIN_POOL_SIZE=70

# Elastic Items Search
ELASTIC_ITEMS_HOST=http://18.222.24.29:9200
ELASTIC_ITEMS_INDEX=items
ELASTIC_ITEMS_TYPE=_doc
```

**Remember not to push nor commit the `.env` file.**

## Deploy

### AWS

This app was deployed using [AWS](https://aws.amazon.com/). The base url is [http://ec2-3-15-18-44.us-east-2.compute.amazonaws.com:3002](http://ec2-3-15-18-44.us-east-2.compute.amazonaws.com:3002).

## About

This project was written and is maintained by [Stepan Galoyan](https://github.com/stepgal).

