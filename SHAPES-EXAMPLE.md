# Shapes Example

This quickstart provides a step-by-step guide to integrating Fingerprint with Approov in a web app using a simple demo API backend for obtaining a random shape. The integration uses plain Javascript without using any libraries or SDKs except those providing the Fingerprint integration. As such, you should be able to use it directly or easily port it to your preferred web framework or library.

## TOC - Table of Contents

* [What You Will Need](#what-you-will-need)
* [What You Will Learn](#what-you-will-learn)
* [How it Works](#how-it-works)
* [Starting the Web Server](#starting-the-web-server)
* [Running the Shapes Web App without Approov](#running-the-shapes-web-app-without-approov)
* [Modify the Web App to use Approov with Fingerprint](#modify-the-web-app-to-use-approov-with-fingerprint)
* [Running the Shapes Web App with Approov and Fingerprint](#running-the-shapes-web-app-with-approov-and-fingerprint)
* [What if I Don't Get Shapes](#what-if-i-dont-get-shapes)
* [Changing Your Own Web App to Use Approov](#changing-your-own-web-app-to-use-approov)
* [Content Security Policy](#content-security-policy)
* [Next Steps](#next-steps)


## WHAT YOU WILL NEED

* Access to a trial or paid Approov account
* The Approov web SDK, `approov.js` - please email support@approov.io to request this file
* A [Fingerprint](https://dashboard.fingerprintjs.com/signup/) subscription
* The `approov` command line tool [installed](https://approov.io/docs/latest/approov-installation/) with access to your account
* A web server or Docker installed
* The contents of the folder containing this README

[TOC](#toc-table-of-contents)


## WHAT YOU WILL LEARN

* How to integrate Fingerprint with Approov into a real web app in a step by step fashion
* How to setup your web app to get valid Approov Fingerprint tokens
* A solid understanding of how to integrate Fingerprint with Approov into your own web app
* Some pointers to other Approov features

[TOC](#toc-table-of-contents)


## HOW IT WORKS

This is a brief overview of how the Approov cloud service and Fingerprint fit together. For a complete overview of how the frontend and backend work with the Approov cloud service, we recommend the [Approov overview](https://approov.io/product) page on our website.

### Fingerprint

Fingerprint provides a powerful mechanism for fingerprinting the browser environment of a user and deriving a visitor ID based on both the raw fingerprint and the history of prior visits. As mentioned previously, the key point is to match a visitor ID with a user profile in the protected back end. This demo, does not cover the backend implementation, but it does embed the visitor ID in an Approov token and include that as part of an API request. <mark>TODO rephrase: This is ample to demonstrate the flow although it doesn't quite fit with the Shapes API use case.</mark>

In the combined Approov/Fingerprint flow

* A Fingerprint result containing a `visitorId` and `requestId` is obtained using the Fingerprint SDK's `get()` function
* An Approov token fetch is performed, passing both the `visitorId` and the `requestId` to the Approov cloud service for verification
* The Approov service calls on the Fingerprint service to verify the `visitorId` and the `requestId`
* The Approov token returned by the Approov service includes the verification result from the Fingerprint service
* For the configured duration of the Approov session no new Fingerprint lookups need to be performed, instead the Approov service provides tokens that cover this period
* The API requests are made as usual by the web app, but additionally, the Approov token is added as a header to the API request

It is always the API backend's responsibility to decide to accept or deny requests. This decision is never made by the client. In all flows using Approov, access should only be granted if a valid Approov token is included with the request. Subsequent server-side checks may further interrogate the contents of the Approov token, and also check other credentials, such as user authorization.

### Approov Cloud Service

The Approov cloud service checks with the Fingerprint cloud service that your web app is indeed being used by a real user in a browser, and then the web protection request is handled such that:

* If the Fingerprint check passes then a valid Approov token is returned to the web app. (In this context, the check consists of verifying that the provided `requestId` matches a request that occurred within a very short time of the request to fetch an Approov token.)
* If the Fingerprint check fails then a legitimate looking Approov token will be returned

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

Now that you have completed the deployment of the web app with one of your preferred web servers it is time to see how it works.

In the home page you can see three buttons. Click the `UNPROTECTED` button to see the unprotected Shapes web app:

<p>
  <img src="/readme-images/unprotected-homepage.png" width="480" title="Shapes unprotected web app home page">
</p>

Click the `HELLO` button and you should see this:

<p>
  <img src="/readme-images/unprotected-hello-page.png" width="480" title="Shapes unprotected web app hello page">
</p>

This checks the connectivity by connecting to the endpoint `https://shapes.approov.io/v1/hello`.

Now press the `SHAPE` button and you will see this:

<p>
  <img src="/readme-images/unprotected-shape-page.png" width="480" title="Shapes unprotected web app shape page">
</p>

This contacts `https://shapes.approov.io/v1/shapes` to get a random shape.

Although the Shapes API is very simple, 2 end-points, with some code in a web app to control presentation, it is sufficient to demonstrate the required changes. The starting point in a real world scenario is, similarly, an API, probably using Approov to protect the mobile channel, and either a new requirement to enable access from the web or a desire to simplify the existing access that uses Fingerprint to bind browser sessions to known users. The code changes below assume the former and take you through the steps to add both Fingerprint and Approov to the Shapes web app.

First, to simulate the web app working with an API endpoint protected with Approov edit `shapes-app/unprotected/assets/js/app.js` and change the `API_VERSION` to `v2`, like this:

```js
const API_VERSION = "v2"
```

Now save the file and do a hard refresh in your browser (`Ctrl + F5` on Windows or Linux, or `Command + Shift + R` on Mac), then hit the `SHAPE` button again and you should see this:

<p>
  <img src="/readme-images/unprotected-v2-shape-page.png" width="480" title="Shapes unprotected web app V2 shape page">
</p>

It gets the status code 400 (Bad Request) because this endpoint is protected by Approov.

The changes below will add the required Approov token to the API request by first issuing a Fingerprint check and then exchanging the returned token for an Approov token using the Approov Fingerprint integration.

[TOC](#toc-table-of-contents)


## MODIFY THE WEB APP TO USE APPROOV WITH FINGERPRINT

We need to obtain the Approov web SDK and include it in the project, modify two files, `index.html` and `app.js` and lastly add some configuration.

If you suspect something has gone wrong while performing the changes you can always compare what you have with the corresponding files in the `shapes-app/approov-fingerprint-protected/` directory.

For example, the following commands will show the set of differences required for the two files that will change:

```text
git diff --no-index shapes-app/unprotected/index.html shapes-app/approov-fingerprint-protected/index.html

git diff --no-index shapes-app/unprotected/assets/js/app.js shapes-app/approov-fingerprint-protected/assets/js/app.js
```

Overall, there are only a few changes required to add both these services.

### Add and Load the Approov Web SDK

In order to obtain a copy of the Approov web SDK please email a request to support@approov.io. When you receive your copy, place the file `approov.js` in the `shapes-app/unprotected/assets/js/` directory.

Modify the `shapes-app/unprotected/index.html` file to load the Approov web SDK by adding this code after the HTML `</body>` tag:

```text
  <script type="module" src="./assets/js/approov.js"></script>
```

### Approov Fingerprint Implementation

Modify the file `shapes-app/unprotected/assets/js/app.js` to import Approov and the configuration and declare the `fpPromise` variable at the top of the file:

```js
import { APPROOV_ATTESTER_DOMAIN, SHAPES_API_KEY, APPROOV_SITE_KEY, FINGERPRINT_BROWSER_TOKEN } from "/config.js"
import { Approov, ApproovError, ApproovFetchError, ApproovServiceError, ApproovSessionError } from "./approov.js"

let fpPromise
```

Then change the window load event listener to initialize `fpPromise` by adding a call to `initFingerprint()` (we will define this in a moment) at the end of the listener:

```js
window.addEventListener('load', (event) => {

  // ... existing body omitted ...

  fpPromise = initFingerprint()
})
```

Lastly, add the code to perform the Fingerprint and Approov calls. The following code should be pasted to replace the existing `addRequestHeaders` function:

```js
function initFingerprint() {
  // Initialize the Fingerprint agent
  const fpPromise = import('https://fpjscdn.net/v3/' + FINGERPRINT_BROWSER_TOKEN)
    .then(FingerprintJS => FingerprintJS.load())
  return fpPromise
}

function getFingerprintData() {
  // Get the Fingerprint visitor identifier and request ID
  return fpPromise.then(fp => fp.get())
}

async function fetchApproovToken(api) {
  try {
    // Try to fetch an Approov token
    let approovToken = await Approov.fetchToken(api, {})
    return approovToken
  } catch (error) {
    // If Approov has not been initialized or the Approov session has expired, initialize and start a new one
    if (error instanceof ApproovSessionError) {
      await Approov.initializeSession({
        approovHost: APPROOV_ATTESTER_DOMAIN,
        approovSiteKey: APPROOV_SITE_KEY,
        fingerprintBrowserToken: FINGERPRINT_BROWSER_TOKEN,
      })
      // Get a fresh Fingerprint result
      let result = await getFingerprintData()
      // Fetch the Approov token
      let approovToken = await Approov.fetchToken(api, {fingerprintRequest: result})
      return approovToken
    } else {
      throw error
    }
  }
}

async function addRequestHeaders() {
  let headers = new Headers({
    'Accept': 'application/json',
    'Api-Key': SHAPES_API_KEY,
  })
  try {
    let approovToken = await fetchApproovToken(API_DOMAIN)
    headers.append('Approov-Token', approovToken)
  } catch (error) {
    console.log(JSON.stringify(error))
  }
  return headers
}
```

Note that, in the case you are migrating from a Fingerprint flow to an Approov flow, the changes are very minor. We would expect the same small changes to be required in your website at each point you construct requests that include the Fingerprint IDs. Depending on how your API calls are constructed, you may be able to make changes so that `fetchApproovToken` is called from a single point.

Before you can run the code it is necessary to obtain values for the placeholders in the configuration file, as described in the next section.

[TOC](#toc-table-of-contents)

## Approov Setup

To use Approov with Fingerprint in the web app we need a small amount of configuration.

### Configure the API Domain with Web Protection

First, we need to use the Approov CLI to register the API domain that will be protected and have it specifically enabled for [web protection](https://approov.io/docs/latest/approov-web-protection-integration/#enable-web-protection-for-an-api). Note that all web-protection domains are also able to serve tokens for the mobile channel. Run the following CLI command to add or update the configuration for the shapes API:

```text
approov api -add shapes.approov.io -allowWeb
```

### Configure Approov with a Fingerprint Subscription

To [configure](https://approov.io/docs/latest/approov-web-protection-integration/#configure-approov-with-a-fingerprint-subscription) Approov with a Fingerprint subscription, [signup here](https://dashboard.fingerprintjs.com/signup/), you must first create it using their [dashboard](https://dashboard.fingerprintjs.com). Copy the browser and API tokens from your subscription into the Approov configuration command below.

If your site key and API key were `your-Fingerprint-browser-token` and `your-Fingerprint-API-token`, respectively, then the command to register it with Approov would look like this:

```text
approov web -fingerprint -add your-Fingerprint-browser-token -apiToken your-Fingerprint-API-token -region RoW
```

When the Fingerprint token is passed to an Approov web-protection server for verification it, in turn, calls out to the Fingerprint servers before performing its checks on the result. Approov checks that the provided `requestId` is associated with the `visitorId` and that it was issued within an acceptable time. Further command line options can be used to configure how Approov handles Fingerprint verification, including adjustments to the acceptable time constraints.

### Replace the Placeholders in the Configuration File

To begin, copy the file `shapes-app/config.js.example` to `shapes-app/config.js` so you can edit the placeholders in `config.js` to include your Approov site key and Fingerprint browser token.

#### Fingerprint Browser Token

Using the browser token retrieved from the Fingerprint dashboard we can now replace the `___FINGERPRINT_BROWSER_TOKEN___` directly in the configuration file, `config.js`, or from the command line.

On Linux and MACs you can use the `sed` command:

```text
sed -i "s|___FINGERPRINT_BROWSER_TOKEN___|your-Fingerprint-browser-token|" ./shapes-app/config.js
```

On Windows you can do it with:

```text
get-content shapes-app\config.js | %{$_ -replace "___FINGERPRINT_BROWSER_TOKEN___","your-Fingerprint-browser-token"}
```

> **NOTE:** Replace the Fingerprint browser token `your-Fingerprint-browser-token` with your own one in the above commands.

#### Approov Site Key

The Approov site key can be obtained with the following command:

```text
approov web -list
```

The Approov site key is the first `Site Key` in the output:

```text
Site Key: 123a4567-abcd-12e3-9z8a-9b1234d54321
Token Lifetime: 5 seconds
Fingerprint:
  Optional: true
  Subscription Key: aaaaa12345
    Region: RoW
    Max Elapsed Time: 2.00s
    Max Bot Probability: 1.00
    Embed Result: true
```

Now, replace the placeholder `___APPROOV_SITE_KEY___` directly in the configuration file, `config.js`, or from the command line.

On Linux and MACs you can use the `sed` command:

```text
sed -i "s|___APPROOV_SITE_KEY___|your-Approov-site-key|" ./shapes-app/unprotected/assets/js/app.js
```

On Windows you can do it with:

```text
get-content shapes-app\unprotected\index.html | %{$_ -replace "___APPROOV_SITE_KEY___","your-Approov-site-key"}
```

> **NOTE:** Replace the Approov site key `your-Approov-site-key` with your own one in the above commands.

[TOC](#toc-table-of-contents)


## RUNNING THE SHAPES WEB APP WITH APPROOV AND FINGERPRINT

Now, that we have completed the Approov Fingerprint integration into the unprotected Shapes web app it is time to test it again.

Reload the page in the browser (`Ctrl + F5` on Windows or Linux, or `Command + Shift + R` on Mac) and then click the `SHAPES` button and this time, instead of a bad request, we should get a shape:

<p>
  <img src="/readme-images/protected-v2-shape-page.png" width="480" title="Shapes protected web app Shape page">
</p>

[TOC](#toc-table-of-contents)


## WHAT IF I DON'T GET SHAPES

This can be due to a number of different causes, but usually is due to a typo, missing one of the steps or executing one of the steps incorrectly, but we will take you through the most probable causes. Note, you can always compare your changes to the example in `shapes-app/approov-fingerprint-protected`.

### Browser Developer Tools

Open the browser developer tools and check if you can see any errors in the console.

If you find errors related with the `app.js` file then fix them and try again, but always remember to reload the page in the browser after updating a Javascript file.

### Fingerprint Script

Check that you are correctly loading the Fingerprint SDK in the `initFingerprint` function in `shapes-app/unprotected/index.html` and that you are correctly initializing it in the window load event listener at the beginning of `shapes-app/unprotected/index.html/assets/js/app.js`. The returned promise must be assigned to the `fpPromise` variable which is declared in the global scope.

### Fingerprint Token

Check that you are using the correct Fingerprint browser token:
* The configuration file `shapes-app/config.js` exists and the placeholder `___FINGERPRINT_BROWSER_TOKEN___` has been replaced
* The token doesn't have a typo

### Approov Site Key

Check that you are using the correct Approov site key:
* The configuration file `shapes-app/config.js` exists and the placeholder `___APPROOV_SITE_KEY___` has been replaced
* The Approov site key doesn't have a typo

### Shapes API Domain

Check that you have added the `shapes.approov.io` API to your Approov account. Use the following Approov CLI command and ensure the API is listed with web protection enabled.

```text
approov api -list
```

### Approov Fingerprint Subscription

Check that you have correctly added your Fingerprint subscription with the Approov CLI:

* check the Fingerprint browser token is correct

```text
approov web -fingerprint -list
```

The output should look like this:

```text
Optional: true
Subscription Key: your-Fingerprint-browser-token
  Region: RoW
  Max Elapsed Time: 2.00s
  Max Bot Probability: 1.00
  Embed Result: true
```

If the Fingerprint Subscription Key (Browser token) is correct, then the next step is to check the Fingerprint secret. For security reasons the Approov CLI never outputs or returns the Fingerprint secret after it is set. To ensure the value is correct you can just re-register the site using [the same CLI command](#register-fingerprint-with-approov) and it will overwrite the entries.

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

The Approov CLI can check Approov token validity and display the claims.

Open the browser developers tools and from the network tab grab the Approov token from the request header `Approov-Token` and then check it with:

```text
approov token -check <approov-token-here>
```

In the output of the above command look for the [embed](https://approov.io/docs/latest/approov-web-protection-integration/#approov-embed-token-claim-for-fingerprint) claim that contains the response details for Fingerprint.

Example of an Approov web protection token containing an `embed` claim with partial Fingerprint results:

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

> **NOTE:** You can get the full results from the Fingerprint request lookup embedded in the token if your API uses encrypted tokens and you specify `-embedResult` when you configure the Fingerprint subscription with the Approov CLI

[TOC](#toc-table-of-contents)


## CHANGING YOUR OWN WEB APP TO USE APPROOV

This quickstart guide has taken you through the steps of adding Approov with Fingerprint to the shapes demonstration web app.

You can follow the same approach to add Approov with Fingerprint into your own web app.

### API Domains

Remember to do an audit of your API to check which end-points should be enabled for web access. When necessary, extend the backend token check to differentiate between mobile app and web app tokens and use that to restrict the access to more sensitive end-points. Once the backend is ready, enable the Approov web protection by adding the `-allowWeb` flag whenever you [register or re-register](https://approov.io/docs/latest/approov-web-protection-integration/#enable-web-protection-for-an-api) an API with the Approov CLI.

### Changing Your API Backend

The Shapes example app uses the API endpoint `https://shapes.approov.io/v2/shapes` hosted on Approov's servers and you can see the code for it in this [Github repo](https://github.com/approov/quickstart-nodejs-koa_shapes-api).

If you want to integrate Approov into your own web app you will need to [integrate](https://approov.io/docs/latest/approov-usage-documentation/#backend-integration) an Approov token check in the backend. Since the Approov token is simply a standard [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) this is usually straightforward.

Check the [Backend API Quickstarts](https://approov.io/resource/quickstarts/#backend-api-quickstarts) examples that provide a detailed walk-through for specific programming languages and frameworks.

[TOC](#toc-table-of-contents)


## CONTENT SECURITY POLICY

In the `content-src` policy of your current web app you will need to add the domains for Approov and Fingerprint APIs:

```
connect-src https://your-domains.com https://web-1.approovr.io/ https://api.sjpf.io/ https://api.fpjs.io/;
```

You can check in isolation the Content Security Policy for your site [here](https://csp-evaluator.withgoogle.com/) or testing it in conjunction with all the other security headers [here](https://securityheaders.com).

[TOC](#toc-table-of-contents)


## NEXT STEPS

If you wish to explore the Approov solution in more depth, then why not try one of the following links as a jumping off point:

* [Approov Free Trial](https://approov.io/signup) (no credit card needed)
* [Approov QuickStarts](https://approov.io/resource/quickstarts)
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
* [About Us](https://approov.io/company)
* [Contact Us](https://approov.io/contact)

[TOC](#toc-table-of-contents)
