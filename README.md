# Approov Web QuickStart: FingerprintJS - Javascript

[Approov](https://approov.io) is an API security solution used to verify that requests received by your API services originate from trusted versions of your apps. The core Approov product is targeted at mobile apps, however, we provide several integrations with 3rd party web protection solutions so that a single back-end Approov check can be used to authorize API access. This quickstart shows how to use the integration with FingerprintJS to add Approov tokens to your API calls.

[FingerprintJS](https://fingerprintjs.com/) provides a powerful mechanism for fingerprinting the browser environment of a user and deriving a visitor ID based on both the raw fingerprint and the history of prior visits. This visitor ID can then be compared against a user identity in the backend system to determine if they match. If they do, then there is a high probability that it is indeed the correct user and operations can proceed. If not, then this may indicate an attempt at account takeover or simply that the user has moved to a different browser environment. In either case, additional verification steps should be introduced into the flow to protect the user’s account.

Note that, FingerprintJS web protection does not solve the same issue as [Approov mobile app attestation](https://approov.io/product) which provides a very strong indication that a request can be trusted. However, for APIs that are used by both the mobile and web channels, a single check to grant access, simplifies the overall implementation of authorization decisions. Approov's integration with FingerprintJS requires that the backend first check that an Approov token is present and that it is correctly signed. Subsequently, the token claims can be read to differentiate between requests coming from the mobile or web channels and to apply any associated restrictions. If required, the full response from the FingerprintJS check can be embedded in the Approov token to be used by that logic. We still recommend that you restrict critical API endpoints to only work from the Mobile App.

This quickstart provides a step-by-step guide to integrating FingerprintJS with Approov in a web app using a simple demo API backend for obtaining a random shape. The integration uses plain Javascript without using any libraries or SDKs. As such, you should be able to use it directly or easily port it to your preferred web framework or library.

If you are looking for another Approov integration you can check our list of [quickstarts](https://approov.io/docs/latest/approov-integration-examples/backend-api/), and if you don't find what you are looking for, then please let us know [here](https://approov.io/contact).


## TOC - Table of Contents

* [What you will need?](#what-you-will-need)
* [What you will learn?](#what-you-will-learn)
* [How it Works?](#how-it-works)
* [Starting the Web Server](#starting-the-web-server)
* [Running the Shapes Web App without Approov](#running-the-shapes-web-app-without-approov)
* [Modify the Web App to use Approov with Fingerprintjs](#modify-the-web-app-to-use-approov-with-fingerprintjs)
* [Running The Shapes Web App With Approov and Fingerprintjs](#running-the-shapes-web-app-with-approov-and-fingerprintjs)
* [What if I don't get Shapes](#what-if-i-dont-get-shapes)
* [Changing your own Web App to use Approov](#changing-your-own-web-app-to-use-approov)
* [Content Security Policy](#content-security-policy)
* [Next Steps](#next-steps)


## WHAT YOU WILL NEED

* Access to a trial or paid Approov account
* A [FingerprintJS](https://dashboard.fingerprintjs.com/signup/) subscription
* The `approov` command line tool [installed](https://approov.io/docs/latest/approov-installation/) with access to your account
* A web server or Docker installed.
* The contents of the folder containing this README

[TOC](#toc-table-of-contents)


## WHAT YOU WILL LEARN

* How to integrate FingerprintJS with Approov into a real web app in a step by step fashion
* How to setup your web app to get valid Approov FingerprintJS tokens
* A solid understanding of how to integrate FingerprintJS with Approov into your own web app
* Some pointers to other Approov features

[TOC](#toc-table-of-contents)


## HOW IT WORKS?

This is a brief overview of how the Approov cloud service and FingerprintJS fit together. For a complete overview of how the frontend and backend work with the Approov cloud service, we recommend the [Approov overview](https://approov.io/product) page on our website.

### FingerprintJS

FingerprintJS provides a powerful mechanism for fingerprinting the browser environment of a user and deriving a visitor ID based on both the raw fingerprint and the history of prior visits. As mentioned previously, the key point is to match a visitor ID with a user profile in the protected back end. This demo, does not cover the backend implementation, but it does embed the visitor ID in an Approov token and include that as part of an API request. This is ample to demonstrate the flow although it doesn't quite fit with the Shapes API use case.

In the combined Approov/FingerprintJS flow, each API request made by the web app is handled such that:

* A FingerprintJS `visitorId` and `requestId` are fetched using the FingerprintJS JS SDK
* A web protection request is made to the Approov cloud service passing both the `visitorId` and the `requestId` for verification
* The Approov token returned from the Approov web protection request is added as a header to the API request
* The API request is made as usual by the web app

The API backend, is always responsible for making the decision to accept or deny requests. This decision is never made by the client. In all flows using Approov, access is only granted if a valid Approov token is included with the request; ; the client (web app or mobile app) is unable to determine the validity of the token. Subsequent checks may further interrogate the contents of the Approov token and also check other credentials, such as user authorization.

### Approov Cloud Service

The Approov cloud service checks with FingerprintJS cloud service that your web app is indeed being used by a real user in a browser, and then the web protection request is handled such that:

* If the FingerprintJS check passes then a valid Approov token is returned to the web app. (In this context, the check consists of verifying that the provided `requestId` matches a request that occurred within a very short time of the request to fetch an Approov token.)
* If the FingerprintJS check fails then a legitimate looking Approov token will be returned

In either case, the web app, unaware of the token's validity, adds it to every request it makes to the Approov protected API(s).

[TOC](#toc-table-of-contents)


## STARTING THE WEB SERVER

This quickstart uses a static web app and so you can use any web server to run it. The web app root is: `./shapes-app/index.html`.

If you have no other preference then please choose from one of the following options.

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

<p>
  <img src="/readme-images/homepage.png" width="480" title="Shapes web app home page">
</p>

[TOC](#toc-table-of-contents)


## RUNNING THE SHAPES WEB APP WITHOUT APPROOV

Now that you have completed the deployment of your web app with one of your preferred web servers is time to see how it works.

In the home page you can see three buttons, and you should now click in the `UNPROTECTED` button and you should now see the Shapes unprotected web app:

<p>
  <img src="/readme-images/unprotected-homepage.png" width="480" title="Shapes unprotected web app home page">
</p>

Click on the `HELLO` button and you should see this:

<p>
  <img src="/readme-images/unprotected-hello-page.png" width="480" title="Shapes unprotected web app hello page">
</p>

This checks the connectivity by connecting to the endpoint `https://shapes.approov.io/v1/hello`.

Now press the `SHAPE` button and you will see this:

<p>
  <img src="/readme-images/unprotected-shape-page.png" width="480" title="Shapes unprotected web app shape page">
</p>

This contacts `https://shapes.approov.io/v1/shapes` to get a random shape.

Although the Shapes API is very simple, 2 end-points, with some code in a web app to control presentation, it is sufficient to demonstrate the required changes. The starting point in a real world scenario is the same. An API, probably using Approov to protect the mobile channel, and either a new requirement to enable access from the web or a desire to simplify the existing access that uses FingerprintJS to bind browser sessions to known users. The code changes below assume the former and take you through the steps to add both FingerprintJS and Approov to the Shapes web app.

First, to simulate the web app working with an API endpoint protected with Approov edit `shapes-app/unprotected/assets/js/app.js` and change the `API_VERSION` to `v2`, like this:

```js
const API_VERSION = "v2"
```

Now save the file and do a hard refresh in your browser with `ctrl + F5`, then hit the `SHAPE` button again and you should see this:

<p>
  <img src="/readme-images/unprotected-v2-shape-page.png" width="480" title="Shapes unprotected web app V2 shape page">
</p>

It gets the status code 400 (Bad Request) because this endpoint is protected by Approov.

The changes below will add the required Approov token to the API request by first issuing a FingerprintJS check and then exchanging the returned token for an Approov token using the Approov FingerprintJS integration.

[TOC](#toc-table-of-contents)


## MODIFY THE WEB APP TO USE APPROOV WITH FINGERPRINTJS

We will need to modify two files, `index.html` and `app.js`.

If you suspect something has gone wrong while performing the changes you can always compare what you have with the associated file in the `shapes-app/approov-fingerprintjs-protected/` directory.

For example, the following commands will show the set of differences required for the two files that will change:

```text
git diff --no-index shapes-app/unprotected/index.html shapes-app/approov-fingerprintjs-protected/index.html

git diff --no-index shapes-app/unprotected/assets/js/app.js shapes-app/approov-fingerprintjs-protected/assets/js/app.js
```

Overall, the changes required to add both these services are small.

### Load the FingerprintJS Script

Modify the `shapes-app/unprotected/index.html` file to load the FingerprintJS script by adding after the HTML `</body>` tag this code:

```text
<script async src="https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs-pro@3/dist/fp.min.js"></script>
```

### Approov FingerprintJS Implementation

Modify the file `shapes-app/unprotected/assets/js/app.js` to declare the `fpPromise` variable at the top:

```js
let fpPromise
```

Then change the window event listener to set the new variable to the promise of initialization (the existing body of the function is omitted below, just add the line at the end):

```js
window.addEventListener('load', (event) => {

  // ... existing body ommitted ...

  fpPromise = initFingerprintJS()
})
```

Lastly, add the code to perform the FingerprintJS and Approov calls. The following code should be pasted on top of the existing `addRequestHeaders` function:

```js
const APPROOV_ATTESTER_URL = 'https://web-1.approovr.io/attest'

// Replace the placeholders with your own values
const APPROOV_SITE_KEY = '___APPROOV_SITE_KEY___'
const FINGERPRINTJS_BROWSER_TOKEN = '___FINGERPRINTJS_BROWSER_TOKEN___'

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
    .then(fingerprintJsData => fetchApproovToken(fingerprintJsData))
    .then(approovToken => {
      return new Headers({
        'Accept': 'application/json', // fix the default being anything "*/*"
        'Approov-Token': approovToken
      })
    })
}
```

Note that, in the case you are migrating from a FingerprintJS flow to an Approov flow, the changes are very minor. We would expect the same small changes to be required in your website at each point you construct requests that include the FingerprintJS IDs. Depending on how your API calls are constructed, you may be able to make changes so that `fetchApproovToken` is called from a single point.

Before you can run the code it's necessary to obtain the values for the placeholders, and you will learn how to do that in the next section.

[TOC](#toc-table-of-contents)


## Approov Setup

To use Approov with FingerprintJS in the web app we need a small amount of configuration.

### Configure the API Domain with Web Protection

First, we need to use the Approov CLI to register the API domain that will be protected and have it specifically enabled for [web protection](https://approov.io/docs/latest/approov-web-protection-integration/#enable-web-protection-for-an-api). Note that all web-protection domains are also able to serve tokens for the mobile channel. Run the following CLI command to add or update the configuration for the shapes API:

```text
approov api -add shapes.approov.io -allowWeb
```

### Configure Approov with a FingerprintJS Subscription

To [configure](https://approov.io/docs/latest/approov-web-protection-integration/#configure-approov-with-a-fingerprintjs-subscription) Approov with a FingerprintJS subscription, [signup here](https://dashboard.fingerprintjs.com/signup/), you must first create it using their [dashboard](https://dashboard.fingerprintjs.com). Copy the browser and API tokens from your subscription into the Approov configuration command below.

If your site key and API key were `aaaaa12345` and `bbbbb12345` respectively then the command to register it with Approov would look like this:

```text
approov web -fingerprintjs -add aaaaa12345 -apiToken bbbbb12345 -region RoW
```

When the FingerprintJS token is passed to an Approov web-protection server for verification it, in turn, calls out to the FingerprintJS servers before performing its checks on the result. Approov checks that the provided `requestId` is associated with the `visitorId` and that it was issued within an acceptable time. Further command line options can be used to configure how Approov handles FingerprintJS verification, including adjustments to the acceptable time constraints.

### Replace the Code Placeholders

The code we added for the integration of FingerprintJS with Approov has some placeholders for which we now have values.

#### FingerprintJS Code

Using the browser token retrieved from the FingerprintJS dashboard we can now replace the `___FINGERPRINTJS_BROWSER_TOKEN___` directly in the code or from the command line.

On Linux and MACs you can use the `sed` command:

```text
sed -i "s|___FINGERPRINTJS_BROWSER_TOKEN___|aaaaa12345|" ./shapes-app/unprotected/assets/js/app.js
```

On Windows you can do it with:

```text
get-content shapes-app\unprotected\index.html | %{$_ -replace "___FINGERPRINTJS_BROWSER_TOKEN___","aaaaa12345"}
```

> **NOTE:** Replace the dummy browser token `aaaaa12345` with your own one.

#### Approov Site Key

The Approov site key, that can be obtained with:

```text
approov web -list
```

The Approov site key is the first `Site Key` in the output:

```text
Site Key: 123a4567-abcd-12e3-9z8a-9b1234d54321
Token Lifetime: 5 seconds
FingerprintJS:
  Optional: true
  Subscription Key: aaaaa12345
    Region: RoW
    Max Elapsed Time: 2.00s
    Max Bot Probability: 1.00
    Embed Result: true
```

Now, replace the placeholder `___APPROOV_SITE_KEY___` directly in the code or from the command line.

On Linux and MACs you can use the `sed` command:

```text
sed -i "s|___APPROOV_SITE_KEY___|123a4567-abcd-12e3-9z8a-9b1234d54321|" ./shapes-app/unprotected/assets/js/app.js
```

On Windows you can do it with:

```text
get-content shapes-app\unprotected\index.html | %{$_ -replace "___APPROOV_SITE_KEY___","123a4567-abcd-12e3-9z8a-9b1234d54321"}
```

> **NOTE:** Replace the dummy Approov site key token `123a4567-abcd-12e3-9z8a-9b1234d54321` with your own one.

[TOC](#toc-table-of-contents)


## RUNNING THE SHAPES WEB APP WITH APPROOV AND FINGERPRINTJS

Now, that we have completed the Approov FingerprintJS integration into the unprotected Shapes web app it's time to test it again.

Refresh the browser with `ctrl + F5` and then click in the `SHAPES` button and this time, instead of a bad request, we should get a shape:

<p>
  <img src="/readme-images/protected-v2-shape-page.png" width="480" title="Shapes protected web app Shape page">
</p>

[TOC](#toc-table-of-contents)


## WHAT IF I DON'T GET SHAPES

This can be due to a lot of different causes, but usually is due to a typo, missing one of the steps or executing one of the steps incorrectly, but we will take you through the most probable causes.

### Browser Developer Tools

Open the browser developer tools and check if you can see any errors in the console.

If you find errors related with the `app.js` file then fix them and try again, but always remember to refresh the browser with `ctrl + F5` after updating a Javascript file.

### FingerprintJS Script

Check that you are correctly loading the FingerprintJS SDK in `shapes-app/unprotected/index.html` and that you are correctly initializing it in the window load event listener at the beginning of `shapes-app/approov-fingerprintjs-protected/assets/js/app.js`. The returned promise must be assigned to the `fpPromise` variable which is declared in the global scope.

### FingerprintJS Token

Check that you are using the correct FingerprintJS browser token:
* the placeholder `___FINGERPRINTJS_BROWSER_TOKEN___` has been replaced
* the token doesn't have a typo

### Approov Site Key

Check that you are using the correct Approov site key:
* the placeholder `___APPROOV_SITE_KEY___` has been replaced
* the Approov site key doesn't have a typo

### Shapes API Domain

Check that you have added with the Approov CLI the `shapes.approov.io` API with web protection enabled.

```text
approov api -list
```

### Approov FingerprintJS Subscription

Check that you have added with the Approov CLI the correct FingerprintJS subscription:

* check the FingerprintJS browser token is correct

```text
approov web -fingerprintjs -list
```

The output should look like this:

```text
Optional: true
Subscription Key: aaaaa12345
  Region: RoW
  Max Elapsed Time: 2.00s
  Max Bot Probability: 1.00
  Embed Result: true
```

If the FingerprintJS Subscription Key (Browser token) is correct, then the next step is to check the FingerprintJS secret. For security reasons the Approov CLI never outputs or returns the FingerprintJS secret after it is set. To ensure the value is correct you can just re-register the site using [the same CLI command](#register-fingerprintjs-with-approov) and it will overwrite the entries.

### Approov Live Metrics

Use the Approov CLI to see the [Live Metrics](https://approov.io/docs/latest/approov-usage-documentation/#live-metrics) and identify the cause of the failure.

```text
approov metrics
```

This will open your Approov Grafana metrics homepage. From there you can select the "Live Metrics" dashboard which includes web-protection request metrics updated every minute (max 2 mins for a request to be visible).

### Approov Web Protection Server Errors

If the Approov web protection server is unable to complete a request then it will respond with an error.

See [here](https://approov.io/docs/latest/approov-web-protection-integration/#troubleshooting-web-protection-errors) the complete list of possible errors that can be returned by the Approov web protection server.

If the error is not displayed in the web page you may need to open the browser developer tools and inspect the json response payload for the request made to the Approov web protection server.

### Debug the Approov Token

The Approov CLI can check the Approov token validity and display the claims.

Open the browser developers tools and from the network tab grab the Approov token from the request header `Approov-Token` and then check it with:

```text
approov token -check <approov-token-here>
```

In the output of the above command look for the [embed](https://approov.io/docs/latest/approov-web-protection-integration/#approov-embed-token-claim-for-fingerprintjs) claim that contains the response details for FingerprintJS.

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
        }
      ]
    }
  }
}
```

(The output of the Approov CLI is not formatted as above.)

> **NOTE:** You can get the full results from the FingerprintJS request lookup embedded in the token if your API uses encrypted tokens and you specify `-embedResult` when you configure the FingerprintJS subscription with the Approov CLI

[TOC](#toc-table-of-contents)


## CHANGING YOUR OWN WEB APP TO USE APPROOV

This quick start guide has taken you through the steps of adding Approov with FingerprintJS to the shapes demonstration web app.

You can follow exactly the same steps to add Approov with FingerprintJS into your own web app.

### API Domains

Remember to do an audit of your API to check which end-points should be enabled for web access. When necessary, extend the backend token check to differentiate between mobile app and web app tokens and use that to restrict the access to more sensitive end-points. Once the backend is ready, enable the Approov web protection by adding the `-allowWeb` flag whenever you [register or re-register](https://approov.io/docs/latest/approov-web-protection-integration/#enable-web-protection-for-an-api) an API with the Approov CLI.

### Changing Your API Backend

The Shapes example app uses the API endpoint `https://shapes.approov.io/v2/shapes` hosted on Approov's servers and you can see the code for it in this [Github repo](https://github.com/approov/quickstart-nodejs-koa_shapes-api).

If you want to integrate Approov into your own web app you will need to [integrate](https://approov.io/docs/latest/approov-usage-documentation/#backend-integration) an Approov token check in the backend. Since the Approov token is simply a standard [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) this is usually straightforward.

Check the [Backend integration](https://approov.io/docs/latest/approov-integration-examples/backend-api/) examples that provide a detailed walk-through for specific programming languages and frameworks.

[TOC](#toc-table-of-contents)


## CONTENT SECURITY POLICY

In the `content-src` policy of your current web app you will need to add the domains for Approov and FingerprintJS APIs:

```
connect-src https://your-domains.com https://web-1.approovr.io/ https://api.sjpf.io/ https://api.fpjs.io/;
```

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
  * [SafetyNet Integration](https://approov.io/docs/latest/approov-usage-documentation/#google-safetynet-integration)
  * [Account Management](https://approov.io/docs/latest/approov-usage-documentation/#user-management)
* [Approov Resources](https://approov.io/resource/)
* [Approov Customer Stories](https://approov.io/customer)
* [Approov Support](https://approov.zendesk.com/hc/en-gb/requests/new)
* [About Us](https://approov.io/company)
* [Contact Us](https://approov.io/contact)

[TOC](#toc-table-of-contents)
