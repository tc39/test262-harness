# Contribution Guidelines

Thank you for your interest in `test262-harness`!

## Development environment

This project relies on [Node.js](https://nodejs.org) version 6 or higher. Once
installed, run the following command in a terminal located at the root of this
project:

    npm install

This will retrieve the Node.js packages necessary to run the project and its
tests

## Running the tests

Execute the following command in a terminal located at the root of this
project:

    npm test

Please ensure that all tests pass before submitting a patch.

Note that many tests reference static files to determine expected behavior.
Some changes may modify these expectations. To ease maintenance, these files
can be automatically updated based on current behavior by setting the
environment variable named `RECORD` prior to running the tests. On Unix-like
systems, this can be achieved by running the tests with the following command:

    RECORD=1 npm test
