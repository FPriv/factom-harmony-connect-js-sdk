Table of Contents
===============
[INTRODUCTION](#Introduction)
- [About This Document](#about)
- [SDK Architecture Overview](#architecture)

[GETTING STARTED](#gettingstarted)
 - [System Requirements](#requirements)
 - [Installation](#installation)
 - [Usage](#usage)
 - [License](#license)

[METHODS](#methods)

[SAMPLE APPLICATION](#sampleapplication)
- [Overview](#overview)
- [Installation](#appinstallation)
- [Usage](#appusage)

<a name="Introduction"></a>INTRODUCTION
============

<a name="about"></a>About This Document
-------------------

This documentation is written for developers with a basic level of coding knowledge and familiarity of the JavaScript programming language.

Readers can find guidelines to quickly get started with building and using the JavaScript SDK for Factom Harmony Connect.

You can learn more about Factom Harmony Connect
[here](https://docs.harmony.factom.com/).

This SDK is open source and can be accessed on Github
[here](https://github.com/FactomProject/factom-harmony-connect-js-sdk).

<a name="architecture"></a>SDK Architecture Overview
-------------------------

![architecture](documentation/pictures/architecture.jpg?raw=true)

**FactomSDK Class:** Manages SDK constructor, product connection and
provides access to other layers.

**Utilities:** Contain functions shared between core components.

**Core:** Contains main components that interact with Connect API.

**Request/Response Handler:** Handles all requests/responses (HTTP /
HTTPS) from Connect API before passing them to other components.


<a name="gettingstarted"></a> GETTING STARTED
===============

This section contains a summary of the steps required to get started
with JavaScript Connect SDK installation.

<a name="requirements"></a> System Requirements
-------------------

In order to use this JavaScript SDK, you will need the following tools:

-   NodeJS v8 or above: Please find the link
    [here](https://nodejs.org/en/). Current node LTS
    version is 10.15.0.

-   NPM: Node installation will include `Npm`, which is responsible for
    dependencies management.

<a name="installation"></a> Installation
-------------

**Node.js**

`npm install factom-harmony-connect`

<a name="usage"></a> Usage
-----

This SDK relies on
[Promises](https://developers.google.com/web/fundamentals/primers/promises)
making it easier to handle the asynchronous requests made to the API.

For more details of a specific module, please refer to the
[**Methods**](#METHODS) section.

If you want to understand how the SDK works in practice, refer to the
[**Sample Application**](#sampleapplication) section.

Below is an example of how to use the SDK. Before executing any
requests, you will need to instantiate an instance of the SDK. The
required parameters include details about the application you will be
using to authenticate your requests. If you do not have an application
yet, you can get one
[here](https://account.factom.com).

```js
const factom = new Factom({
  baseUrl: "YOUR API URL",
  accessToken: {
    appId: "YOUR APP ID",
    appKey: "YOUR APP KEY"
  },
});
```


When the Factom SDK is initialized, there will be an optional
`automaticSigning` param, which defaults to `true`.

-   When this initial config is set to `true` as default, all chain
    and entry POST methods require passing the params:
    `signerPrivateKey` and `signerChainId` which will be used to create signed chains and entries,
    as per the [Factom Signing Standard](https://docs.harmony.factom.com/docs/factom-signing-standard).

-   When this initial config is set to `false`, the FactomSDK will not sign the chains and entries that are
    created and therefore it does not require the params: `signerPrivateKey` and `signerChainId`.

The primary benefit of `automaticSigning` param is to encourage you to
create chains and entries with unique signatures. Later on, you can
validate that the chains or entries were created by you or that a
certain user/device/ organization/etc. actually signed and published a
certain message that you see in your chain.

Now that you have initialized the SDK, you can use the SDK\'s Methods,
which will execute the necessary REST API calls on your behalf.
Following the [Promises](https://developers.google.com/web/fundamentals/primers/promises)
notation, you should use `Async/Await syntax` or `.then()/.catch in ES5` to
handle successful and failed requests.

All **Method** calls take an object as a parameter.

**Async/Await**
```js
const DoSomeThingWithData = async () => {
  try {
    const response = await factom.identities.create({
      name: [... < your names array > ]
      keys: [... < your public key array > ]
    })
    // handle the response
  } catch (error) {
    // handle the error
  }
}
```

**ES5 syntax**
```js
function DoSomeThingWithData() {
  factom.identities.create({
    name: [... < your names array > ]
    keys: [... < your public key array > ]
  }).then((response) => {
    // handle the response
  }).catch((error) => {
    // handle the error
  })
}
```

Patterns to utilize the Factom SDK:
```js
// Return a JSON chain object as is from the API.
const chain = await FactomSDK.chains.get({
  chainId: '5dc94c605769d8e9dac1423048f8e5a1182e575aab6d923207a3a8d15771ad63',
});

// Return JSON entries array as is from API.

const entries = await FactomSDK.chains.entries.list({
  chainId: '5dc94c605769d8e9dac1423048f8e5a1182e575aab6d923207a3a8d15771ad63',
});

// Return a JSON single entry object as is from the API.

const entry = await FactomSDK.chains.entries.get({
  chainId: '5dc94c605769d8e9dac1423048f8e5a1182e575aab6d923207a3a8d15771ad63',
  entryHash: 'e0e2b7f7920ce25c20cf98c13ae454566e7cda7bb815b8a9ca568320d7bdeb93',
});
```
**Note:** The SDK allows for override values that were set in the instatiation of the SDK on a per-method call basis. To override the parameters that were set in the instantiated SDK class, you may specify any of the following properties in the calls where these properties apply:
* `appId`
* `appKey`
* `baseUrl`
* `automaticSigning`

Example:
```js
// Create a chain with automaticSigning turned off for one call
const createChainResponse = await factomConnectSDK.chains.create({
  externalIds: ["NotarySimulation", "CustomerChain", "cust123"],
  content: "This chain represents a notary service's customer in the NotarySimulation, a sample implementation provided as part of the Factom Harmony SDKs. Learn more here: https://docs.harmony.factom.com/docs/sdks-clients",
  automaticSigning: false

});

// Return a JSON chain object as is from the API with new appId, appKey, and baseUrl.
const chain = await FactomSDK.chains.get({
  chainId: '5dc94c605769d8e9dac1423048f8e5a1182e575aab6d923207a3a8d15771ad63',
  accessToken: {
    appId: "YOUR APP ID",
    appKey: "YOUR APP KEY"
  },
  baseUrl: "YOUR API URL"
});

// Return JSON entries array as is from API with new appId, appKey, and baseUrl.
const entries = await FactomSDK.chains.entries.list({
  chainId: '5dc94c605769d8e9dac1423048f8e5a1182e575aab6d923207a3a8d15771ad63',
  accessToken: {
    appId: "YOUR APP ID",
    appKey: "YOUR APP KEY"
  },
  baseUrl: "YOUR API URL"
});

// Return a JSON single entry object as is from the API with new appId, appKey, and baseUrl.
const entry = await FactomSDK.chains.entries.get({
  chainId: '5dc94c605769d8e9dac1423048f8e5a1182e575aab6d923207a3a8d15771ad63',
  entryHash: 'e0e2b7f7920ce25c20cf98c13ae454566e7cda7bb815b8a9ca568320d7bdeb93',
  accessToken: {
    appId: "YOUR APP ID",
    appKey: "YOUR APP KEY"
  },
  baseUrl: "YOUR API URL"
});
```


<a name="license"></a> License
-------

The Harmony Connect SDK is provided with an MIT License.

# <a name="methods"></a> METHODS

<a name="utils"></a>[utils](documentation/utils.md)
 - <a name="generateKeyPair"></a>[generateKeyPair](documentation/utils.md#generateKeyPair)

<a name="identities"></a>[identities](documentation/identities.md)
  - <a name="identitiesCreate"></a>[create](documentation/identities.md#identitiesCreate)
  - <a name="identitiesGet"></a>[get](documentation/identities.md#identitiesGet)
  - <a name="identitiesKeys"></a>[keys](documentation/identities.md#identitiesKeys)
     - <a name="keysList"></a>[list](documentation/identities.md#keysList)
     - <a name="keysGet"></a>[get](documentation/identities.md#keysGet)
     - <a name="keysReplace"></a>[replace](documentation/identities.md#keysReplace)

<a name="apiInfo"></a>[apiInfo](documentation/apiInfo.md)
  - <a name="infoGet"></a>[get](documentation/apiInfo.md#getInfo)

<a name="chains"></a>[chains](documentation/chains.md)
  - <a name="chainsGet"></a>[get](documentation/chains.md#chainsGet)
  - <a name="chainsCreate"></a>[create](documentation/chains.md#chainsCreate)
  - <a name="chainsList"></a>[list](documentation/chains.md#chainsList)
  - <a name="chainsSearch"></a>[search](documentation/chains.md#chainsSearch)
  - <a name="chainsEntries"></a>[entries](documentation/chains.md#chainsEntries)
     - <a name="entriesGet"></a>[get](documentation/chains.md#entriesGet)
     - <a name="entriesCreate"></a>[create](documentation/chains.md#entriesCreate)
     - <a name="entriesList"></a>[list](documentation/chains.md#entriesList)
     - <a name="entriesFirst"></a>[getFirst](documentation/chains.md#entriesFirst)
     - <a name="entriesLast"></a>[getLast](documentation/chains.md#entriesLast)
     - <a name="entriesSearch"></a>[search](documentation/chains.md#entriesSearch)

# <a name="sampleapplication"></a> SAMPLE APPLICATION


<a name="overview"></a> Overview
--------
![architecture](documentation/pictures/sample-app-1.jpg?raw=true)

This Sample App is created to illustrate some of the core methods of this SDK and a real-world
business scenario of how it can be used.

Since the application is built as a standalone application with a backend SDK process,
the reader should review the commented code [here](https://github.com/FactomProject/factom-harmony-connect-js-sdk/blob/master/sample-app/simulateNotary.js).

The concept of the Sample App is a simple Notary service with a business flow as follows:


-   **A Notary service begins using Factom Harmony:** To use Harmony, there should be at least 1 identity used when signing written data. So, to start, the app creates an identity’s chain for the Notary service.

-   **The first customer purchases the Notary service’s new “Blockchain authentication” service tier:** To track the customer’s documents, the app creates a signed chain for them, allowing easy retrieval for that customer’s records.


-   **The customer requests notarization of the first document:** The app creates a signed entry within the customer’s chain containing a hashed version of the document. At this time, the notary service should also be storing the document in a secure location.

-   **The customer returns at a later date and the clerk retrieves the past work for this customer:** The app searches the blockchain for the customer’s chain, and with that data, retrieves the chain. The SDK automatically validates the authenticity of this chain, which ensures that the Notary’s systems have not been tampered with and the blockchain data was submitted by the Notary service.

-   **The customer requests the document that was notarized:** The app searches for an entry in the chain validated in the step above and gets that entry info, then validates the authenticity of the signature used to sign that entry.


-   **The document’s authenticity is validated:** The app pulls out the document’s hash from the entry’s content and compares it against a freshly generated hash of a stored document.
    -   **Note:** It is recommended that in a real-world scenario, scheduled tasks are run to validate the data for proactive validation.

-   **A developer who had access to one of the keys leaves employment with the Notary company, so they carry out proactive security:** The app replaces the old key pair that the employee had access to.


<a name="appinstallation"></a> Installation
------------

1.  Checkout the repository.
2.  Run `npm install`.
3.  Run `npm run build`.
4.  Navigate to folder `cd ./sample-app`.
5.  Open `configure.js`.
6.  Change configuration settings with your baseUrl, appId and appKey, which can be found or generated at <https://account.factom.com>.
7.  Run `node server.js`.
8.  Open localhost:8080 on your browser.

<a name="appusage"></a> Usage
-----

**Starting screen:** The app comes with a starting page where the user
clicks the "Run Notary Simulation" button to run the app.

![architecture](documentation/pictures/sample-app-2.jpg?raw=true)

**Simulating screen:** Then the system will take some time to generate all
responses by calling the Harmony Connect API through the JavaScript
Connect SDK in Node JS backend.

![architecture](documentation/pictures/sample-app-3.jpg?raw=true)

**Response screen:** After the loading process is finished, the app will display relevant data with regard to this business flow.

![architecture](documentation/pictures/sample-app-4.jpg?raw=true)
