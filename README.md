# Laura's NC Games API

## Background

Laura's NC Games is a demo API which accesses application data programmatically and provides the information to the front end architecture.

The API was built in Node.js using Express.js and uses node-postgres to interact with a PSQL database.

This repo includes separate environments for test and development, with separate databases.

---

## Heroku hosted version

This project is hosted at the URL https://lauras-nc-games.herokuapp.com/api

---

## Cloning and installing dependencies

To run this project on your own machine, first install Node.js(v16.13.1) and PostgreSQL(14.1). You can then fork this repository to your own GitHub account and clone your version locally. To do this, type 'git clone' into the command line, paste in the repo address and press enter. This creates a new folder ('be-nc-games'). Navigate into this folder (by entering 'cd be-nc-games' into the command line) and install the necessary dependencies ('npm install').

---

## Setting up

Create the databases by running the setup.sql file provided. To seed the development database, run the seed script provided in the package.json('node ./db/seeds/run-seed.js') To run the tests, enter 'npm t' into the command line. The test database will automatically be seeded before every test is run.

To access the development environment, run the listen.js file by entering 'node.listen.js into the command line. The endpoints can then be accessed locally by entering 'localhost:9090<endpoint>' into a web browser or a REST client (eg Insomnia). To stop the listener, and return to the command line press ctrl and c.

The Heroku hosted version of the project can be accessed at the URL https://lauras-nc-games.herokuapp.com/api.

---

## Available endpoints

The endpoint GET /api/ responds with a JSON file describing all the available endpoints on the API. This includes details of any available queries on each endpoint together with example requests and responses.
