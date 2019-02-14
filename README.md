# factom-harmony-connect-js-sdk

This repo contains the code for the Factom JavaScript SDK. The purpose of this SDK is to simplfy the process of integrating the Factom's Harmony REST API into a node backend or the client side of a single-page application.

To install the dependencies needed to work on the SDK, simply run

`npm install`

Once you're done, to generate a final build, simply run

`npm run build`

## Testing

This repository uses the Jest framework for testing. In order to run tests, go through `npm run test`.

## Sample Application

To help developers better understand how the SDK works in practice, there is a sample application in the `sample-app` directory. This is a very simple application that simulates the notarization of a PDF file.

### Steps to Run Sample Application

1) `cd sample-app`
2) `node server.js`
3) Open http://localhost:8080 in your browser
