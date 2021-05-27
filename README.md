# Approov Web QuickStart: FingerprintJS - Javascript

[Approov](https://approov.io) is an API security solution used to verify that requests received by your API services originate from trusted versions of your apps.

This quickstart is written specifically for web apps making API calls that you wish to protect with the Approov FingerprintJS integration.

The quickstart is agnostic of any web framework, because the simple Javascript functions it relies on are easily ported to any web framework.

This quickstart provides a step-by-step example of integrating Approov with FingerprintJS into a web app using a simple Shapes example that shows a geometric shape based on a request to an API backend that can be protected with Approov.

If you are looking for another Approov integration you can check our list of [quickstarts](https://approov.io/docs/latest/approov-integration-examples/backend-api/), and if you don't find what you are looking for, then please let us know [here](https://approov.io/contact).


## TOC - Table of Contents

* [What you will need?](#what-you-will-need)
* [What you will learn?](#what-you-will-learn)
* [Starting the Web Server](#starting-the-web-server)
* [Running the Shapes Web App without Approov](#running-the-shapes-web-app-without-approov)
* [Modify the Web App to use Approov with Fingerprintjs](#modify-the-web-app-to-use-approov-with-fingerprintjs)
* [Running The Shapes Web App With Approov And Fingerprintjs](#running-the-shapes-web-app-with-approov-and-fingerprintjs)
* [What if I don't get Shapes](#what-if-i-dont-get-shapes)
* [Changing your own Web App to use Approov](#changing-your-own-web-app-to-use-approov)
* [Security Headers](#security-headers)
* [Next Steps](#next-steps)


## WHAT YOU WILL NEED

* Access to a trial or paid Approov and FingerprintJS account
* The `approov` command line tool [installed](https://approov.io/docs/latest/approov-installation/) with access to your account
* A web server or Docker installed.
* The contents of the folder containing this README

[TOC](#toc-table-of-contents)


## WHAT YOU WILL LEARN

* How to integrate Approov into a real web app in a step by step fashion
* How to setup your web app to get valid tokens from Approov
* A solid understanding of how to integrate Approov with FingerprintJS into your own web app
* Some pointers to other Approov features

[TOC](#toc-table-of-contents)


## STARTING THE WEB SERVER

This quickstart uses a static web app, therefore agnostic of which web server will be used to serve it.

We will give you three quick options, but feel free to use any web server of your choice to serve the web app from `./shapes-app/index.html`.

### Docker

From the root of the quickstart run:

```txt
sudo docker-compose up local
```

This will first build the docker image and then start a container with it.

### Python

If your system has Python 3 installed then the simplest way to run the web server is to:

```
cd shapes-app
python3 -m http.server
```

### NodeJS

If you have NodeJS installed you can do:

```
cd shapes-app
npm install http-server -g
http-server --port 8000
```

### Running the Web App

Now visit http://localhost:8000 and you should be able to see:

!["Shapes web app home page"](/readme-images/homepage.png)

[TOC](#toc-table-of-contents)


## RUNNING THE SHAPES WEB APP WITHOUT APPROOV

Now that you have completed the deployment of your web app with one of your preferred web servers is time to see how it works.

In the home page you can see three buttons, and you should now click in the `UNPROTECTED` button and you should now see the Shapes unprotected web app:

!["Shapes unprotected web app home page"](/readme-images/unprotected-homepage.png)

Click on the `HELLO` button and you should see this:

!["Shapes unprotected web app hello page"](/readme-images/unprotected-hello-page.png)

This checks the connectivity by connecting to the endpoint `https://shapes.approov.io/v1/hello`.

Now press the `SHAPE` button and you will see this:

!["Shapes unprotected web app shape page"](/readme-images/unprotected-shape-page.png)

This contacts `https://shapes.approov.io/v1/shapes` to get a random shape.

In a real world scenario the shapes endpoint would be an endpoint that you want to protect from being exploited/abused from unauthorized clients, like bots or modified web apps.

To protect this endpoints you decide to start using Approov with FingerprintJS. To simulate the web app working with an API enpoint protected with Approov edit `shapes-app/unprotected/assets/js/app.js` and change the `API_VERSION` to `v2`, like this:

```js
const API_VERSION = "v2"
```

Now save the file and in your browser do a hard refresh with `ctrl + F5`, then hit the `SHAPE` button again and you should see this:

!["Shapes unprotected web app V2 shape page"](/readme-images/unprotected-v2-shape-page.png)

It gets the status code 400 (`Bad Request`) because this endpoint is protected with an Approov FingerprintJS token.

Next, you will add Approov with FingerprintJS into the web app so that it can generate valid Approov tokens and get shapes.

[TOC](#toc-table-of-contents)


## MODIFY THE WEB APP TO USE APPROOV WITH FINGERPRINTJS

We will need to modify two files, the `index.html` and the `app.js`.

### Load the FingerprintJS Script

Modify the `shapes-app/unprotected/index.html` file to load the FingerprintJS script by adding after the HTML `</body>` tag this code:

```text
<script async src="https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs-pro@3/dist/fp.min.js"></script>
```

### Approov FingerprintJS Implementation

Before we start let's see the Javascript code difference between the Approov unprotected and protected Shapes web app:

```text
git diff --no-index shapes-app/unprotected/assets/js/app.js shapes-app/approov-fingerprintjs-protected/assets/js/app.js
```

As we can see the necessary Javascript code to implement Approov in a web app app is simple and short.

Let's start to implement Approov in the Shapes unprotected app...

Modify the file `shapes-app/unprotected/assets/js/app.js` to add this code at the top:

```js
let fpPromise
```

Modify the file `shapes-app/unprotected/assets/js/app.js` to update the `load` event listener:

```js
// Already exists but needs `fpPromise` added to it.
window.addEventListener('load', (event) => {

  // existing code ommitted

  // add this new line of code to the `load` event listener
  fpPromise = initFingerprintJS()
})

const API_VERSION = "v2"
const API_DOMAIN = "shapes.approov.io"
const API_BASE_URL = "https://" + API_DOMAIN
```

Modify the file `shapes-app/unprotected/assets/js/app.js` to insert between `const API_BASE_URL` and `fetchHello()` the following code:

```js
// const API_BASE_URL = "https://" + API_DOMAIN

// Replace the placeholders with your own values
const APPROOV_SITE_KEY = '___APPROOV_SITE_KEY___'
const FINGERPRINTJS_BROWSER_TOKEN = '___FINGERPRINTJS_BROWSER_TOKEN___'
const APPROOV_ATTESTER_URL = '___APPROOV_ATTESTER_URL___'

function initFingerprintJS() {
  // Initialize an agent at application startup.
  return FingerprintJS.load({ token: FINGERPRINTJS_BROWSER_TOKEN })
}

function fetchFingerprintJsData() {
  // Get the visitor identifier when you need it.
  return fpPromise.then(fp => fp.get())
}

// The Fingerprint token needs to be retrieved each time we want to make a
// API request with an Approov Token.
function fetchApproovToken(fingerprintJsData) {
  const params = new URLSearchParams()

  // Add it like `example.com` not as `https://example.com`.
  params.append('api', API_DOMAIN)
  params.append('fingerprintjs-visitor-id', fingerprintJsData.visitorId)
  params.append('fingerprintjs-request-id', fingerprintJsData.requestId)
  params.append('approov-site-key', APPROOV_SITE_KEY)
  params.append('fingerprintjs-token', FINGERPRINTJS_BROWSER_TOKEN)

  return fetch(APPROOV_ATTESTER_URL, {
      method: 'POST',
      body: params
    })
    .then(response => {
      if (!response.ok) {
        console.debug('Approov token fetch failed: ', response)
        throw new Error('Failed to fetch an Approov Token') // reject with a throw on failure
      }

      return response.text() // return the token on success
    })
}

function addRequestHeaders() {
  return fetchFingerprintJsData()
    .then(fingerprintJsData => {
      return fetchApproovToken(fingerprintJsData)
    })
    .then(approovToken => {
      return new Headers({
        'Api-Key': 'your-api-key-goes-here',
        'Approov-Token': approovToken
      })
    })
}

// function fetchHello() {...}
```

After you have updated the file `shapes-app/unprotected/assets/js/app.js` it should look the same as the file `shapes-app/approov-fingerprintjs-protected/assets/js/app.js`. You can check that they are the same with:

```text
git diff --no-index shapes-app/unprotected/assets/js/app.js shapes-app/approov-fingerprintjs-protected/assets/js/app.js
```
> **NOTE:** When files are the same you don't see any output.

Before you run the code you need to obtain the values for the placeholders, and you will learn how to in the next section.

[TOC](#toc-table-of-contents)


## Approov Setup

To use Approov with FingerprintJS in the web app we need a small amount of configuration.

### Configure the API Domain with Web Protection

First, Approov needs to know the API domain that will be protected and have it configured with [web protection](https://approov.io/docs/latest/approov-usage-documentation/#enable-web-protection-for-an-api).

In order for Approov tokens to be generated for `https://shapes.approov.io/v2/shapes` it is necessary to inform Approov about it, and you can do it with:

```
approov api -add shapes.approov.io -allowWeb
```
> **NOTE:** When integrating in your own web app you need to replace `shapes.approov.io` with `your.api.domain.com`.

### Configure Approov with a FingerprintJS Subscription

To [configure](https://approov.io/docs/latest/approov-usage-documentation/#configure-approov-with-a-fingerprintjs-subscription) Approov with a FingerprintJS subscription you need to have an account with them, therefore if you don't have one then [signup here](https://dashboard.fingerprintjs.com/signup/) for a trial account.

```text
approov web -fingerprintjs -add <FingerprintJS-BrowserToken> -apiToken <FingerprintJS-APIToken> -region RoW
```

You need to go into the [FingerprintJS Dashboard](https://dashboard.fingerprintjs.com) and obtain the browser and API tokens.

Considering that your browser token is `aaaaa12345`  and the API token is `bbbbb12345` then your command should look like this:

```text
approov web -fingerprintjs -add aaaaa12345 -apiToken bbbbb12345 -region RoW -embedResult
```

We add the `-embedResult` flag only when we want to [have access](https://approov.io/docs/latest/approov-usage-documentation/#approov-embed-token-claim-for-fingerprintjs) to the full response from the FingerprintJS request lookup made by the Approov web attester to the FingerprintJS API. In this quickstart we are adding it for debug proposes only.

### Replace the Code Placeholders

The code we added for the Approov FingerprintJS integration has some placeholders that we now have values for, therefore we need to replace them.

> **IMPORTANT:** In a production app don't hard-code this values into the code. Instead replace them when the app is deployed.

#### FingerprintJS Code

Using the browser token retrieved from the FingerprintJS dashboard we can now replace the `___FINGERPRINTJS_BROWSER_TOKEN___` directly in the code or with:

```text
sed -i "s|___FINGERPRINTJS_BROWSER_TOKEN___|aaaaa12345|" ./shapes-app/unprotected/assets/js/app.js
```
> **NOTE:** Replace the dummy browser token `aaaaa12345` with your own one.

#### Approov Site Key

The Approov site key, that can be obtained with:

```text
approov web -list
```

Somewhere in the output you will find the `Site Key`, that looks like:

```text
Site Key: 123a4567-abcd-12e3-9z8a-9b1234d54321
```

Replace the placeholder `___APPROOV_SITE_KEY___` directly in the code or just do it with:

```text
sed -i "s|___APPROOV_SITE_KEY___|123a4567-abcd-12e3-9z8a-9b1234d54321|" ./shapes-app/unprotected/assets/js/app.js
```
> **NOTE:** Replace the dummy Approov site key token `123a4567-abcd-12e3-9z8a-9b1234d54321` with your own one.

#### Approov Web Attester

Replace the placeholder `___APPROOV_SITE_KEY___` directly in the code or just do it with:

```text
sed -i "s|___APPROOV_ATTESTER_URL___|https://web-1.approovr.io/attest|" ./shapes-app/unprotected/assets/js/app.js
```

[TOC](#toc-table-of-contents)


## RUNNING THE SHAPES WEB APP WITH APPROOV AND FINGERPRINTJS

Now, that we have completed the Approov FingerprintJS integration into the unprotected Shapes web app it's time to test it again.

Refresh the browser with `ctrl + F5` and then click in the `SHAPES` button and this time instead of a bad request we should get a shape:

!["Shapes protected web app Shape page"](/readme-images/protected-v2-shape-page.png)

This time we got a shape because the web app is performing the API request to the Shapes endpoint with a valid Approov token.

[TOC](#toc-table-of-contents)


## WHAT IF I DON'T GET SHAPES

If none of the below helps you find your error, then we advise you to double check carefully that you followed exactly all the steps, and maybe even start from scratch again. If you still experience issues feel free to contact us.

### Browser Developer Tools

Open the browser developer tools and double check if you can see any errors in the console.

If you find errors related with the `app.js` file then fix them and retry again, but always remember to refresh the browser with `ctrl + F5` when updating Javascript.

### FingerprintJS Script

Double check that you are correctly loading the script in the `shapes-app/unprotected/index.html` file and that you are initiating correctly FingerprintJS in the window load event listener at the `shapes-app/approov-fingerprintjs-protected/assets/js/app.js` file, and that you have assigned it to the `fpPromise` variable defined at the top of the same file.

### FingerprintJS Token

Double check that you are using the correct FingerprintJS browser token:
* the placeholder `___FINGERPRINTJS_BROWSER_TOKEN___` has been replaced
* the token doesn't have a typo

### Approov Site Key

Double check that you are using the correct Approov site key:
* the placeholder `___APPROOV_SITE_KEY___` has been replaced
* the Approov site key doesn't have a typo

### Approov Attester URL

Double check that you are using the correct Approov site key:
* the placeholder `___APPROOV_ATTESTER_URL___` has been replaced
* the Approov attester URL doesn't have a typo

### Shapes API Domain

Double check that you have added with the Approov CLI the `shapes.approov.io` API with web enabled.

```text
approov api -list
```

### Approov FingerprintJS Subscription

Double check that you have added with the Approov CLI the correct FingerprintJS subscription:
* check the FingerprintJS browser token is the correct one and that doesn't have a typo
* check the FingerprintJS API token is the correct one and doesn't have a typo

```text
approov web -list
```

### Approov Live Metrics

Use the Approov CLI to see the [Live Metrics](https://approov.io/docs/latest/approov-usage-documentation/#live-metrics) and identify the cause of the failure.

```text
approov metrics
```

This will open a Grafana dashboard in your browser from where you can see detailed metrics.

### Approov Web Attester Errors

If something is wrong with your Approov integration, that prevents the Approov web attester to complete the attestation, then an error response will be returned.

See [here](https://approov.io/docs/latest/approov-usage-documentation/#troubleshooing-web-protection-errors) the complete list of possible errors that can be returned by the Approov web attester.

If the error is not displayed in the web page you may need to open the browser developer tools and inspect the json response payload for the request made to the Approov web attester.

### Debug the Approov Token

The Approov CLI allows to check the approov token validity and its claims.

Open the browser developers tools and from the network tab grab the Approov token from the request header `Approov-Token` and then check it with:

```text
approov token -check <approov-token-here>
```

In the output of the above command look for the [embed](https://approov.io/docs/latest/approov-usage-documentation/#approov-embed-token-claim-for-fingerprintjs) claim that contains the response details for FingerprintJS.

Example of the `embed` claim present in an Approov token:

```json
{
  "exp": 1620128085,
  "ip": "1.2.3.4",
  "arc": "EAM2W37PSU",
  "embed": {
    "fpjs:wdATWfQIsdYwATBYYIch": {
      "visitorId": "eZsCHxhztqEOX0ZmOlwi",
      "visits": [
        {
          "requestId": "Otc6rGJcax7PrUuby7GA",
          "browserDetails": {
            "browserName": "Chrome",
            "browserMajorVersion": "90",
            "browserFullVersion": "90.0.4430",
            "os": "Linux",
            "device": "Other",
            "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
            "botProbability": 0
          },
          "incognito": false,
          "ip": "1.2.3.4",
          "ipLocation": { "<IP-keys...>": "<IP-values...>" },
          "time": "2021-05-04T11:32:30Z",
          "timestamp": 1620127950391,
          "url": "<URL-of-the-calling-webpage>",
          "tag": {}
        }
      ]
    }
  }
}
```

[TOC](#toc-table-of-contents)


## CHANGING YOUR OWN WEB APP TO USE APPROOV

This quick start guide has taken you through the steps of adding Approov with FingerprintJS to the shapes demonstration web app.

You can follow exactly the same steps to add Approov with FingerprintJS into your own web app.

### API Domains

Remember you need to [add](https://approov.io/docs/latest/approov-usage-documentation/#enable-web-protection-for-an-api) all of the API domains that you wish to protect with Approov and FingerprintJS without forgetting to enable the web protection with the `-allowWeb` flag.

### Changing Your API Backend

The Shapes example app uses the API endpoint `https://shapes.approov.io/v2/shapes` hosted on Approov's servers and you can see the code for it in this [Github repo](https://github.com/approov/quickstart-nodejs-koa_shapes-api).

If you want to integrate Approov into your own web app you will need to [integrate](https://approov.io/docs/latest/approov-usage-documentation/#backend-integration) an Approov token check on its backend.

Since the Approov token is simply a standard [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) this is usually straightforward. A complementary check for the FingerprintJS `vistorID` is also recommended and you can learn more about why [here](https://approov.io/docs/latest/approov-usage-documentation/#fingerprintjs).

Check this [Backend integration](https://approov.io/docs/latest/approov-integration-examples/backend-api/) examples that provide a detailed walk-through for specific programming languages and frameworks.

[TOC](#toc-table-of-contents)


## SECURITY HEADERS

If your app is not using any Security Headers we strongly recommend you to take the time to add them.

You can check how your web app ranks in terms of security headers [here](https://securityheaders.com).


### Content Security Policy

If your web app is not using yet the [Content Security Policy](https://content-security-policy.com/) header we strongly recommend you to add one.

In the `content-src` policy of your current web app you will need to add the domains for Approov and FingerprintJS APIs:

```
connect-src https://your-domains.com https://web-1.approovr.io/ https://api.sjpf.io/ https://api.fpjs.io/;
```

> **IMPORTNAT:** In your app you need to replace `https://api.sjpf.io/` and `https://api.fpjs.io/` with the customs domains you have set in the FingerprintJS Dashboard. The customs doamins are necessary to avoid being blocked by AD blockers.

You can check in isolation the Content Security Policy for your site [here](https://csp-evaluator.withgoogle.com/) or testing it in conjunction with all the other security headers [here](https://securityheaders.com).

[TOC](#toc-table-of-contents)


## NEXT STEPS

If you wish to explore the Approov solution in more depth, then why not try one of the following links as a jumping off point:

* [Approov Free Trial](https://approov.io/signup) (no credit card needed)
* [Approov QuickStarts](https://approov.io/docs/latest/approov-integration-examples/)
* [Approov Live Demo](https://approov.io/product/demo)
* [Approov Blog](https://blog.approov.io)
* [Approov Docs](https://approov.io/docs)
  * [Metrics Graphs](https://approov.io/docs/latest/approov-usage-documentation/#metrics-graphs)
  * [Security Policies](https://approov.io/docs/latest/approov-usage-documentation/#security-policies)
  * [Manage Devices](https://approov.io/docs/latest/approov-usage-documentation/#managing-devices)
  * [Service Monitoring](https://approov.io/docs/latest/approov-usage-documentation/#service-monitoring)
  * [Automated Approov CLI Usage](https://approov.io/docs/latest/approov-usage-documentation/#automated-approov-cli-usage)
  * [Offline Security Mode](https://approov.io/docs/latest/approov-usage-documentation/#offline-security-mode)
  * [SafetyNet Integration](https://approov.io/docs/latest/approov-usage-documentation/#google-safetynet-integration)
  * [Account Management](https://approov.io/docs/latest/approov-usage-documentation/#user-management)
* [Approov Resources](https://approov.io/resource/)
* [Approov Customer Stories](https://approov.io/customer)
* [Approov Support](https://approov.zendesk.com/hc/en-gb/requests/new)
* [About Us](https://approov.io/company)
* [Contact Us](https://approov.io/contact)

[TOC](#toc-table-of-contents)
