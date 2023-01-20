# Approov Quickstart: Web - Javascript - Fingerprint

This quickstart is for Javascript web apps that are using the Fingerprint service and that you wish to protect with Approov. If this is not your situation then please check if there is a more relevant quickstart guide available.

This quickstart provides the basic steps for integrating Approov into your web app. A more detailed step-by-step guide using a [Shapes App Example](./SHAPES-EXAMPLE.md) is also available.

To follow this guide you should have received an onboarding email for a [trial or paid Approov account](https://approov.io/signup).

## ADDING THE APPROOV WEB SDK

The Approov web SDK can be downloaded using the [Approov command line tool](https://approov.io/docs/latest/approov-cli-tool-reference/) (see the [installation instructions](https://approov.io/docs/latest/approov-installation/)). Use the following command to download the latest web SDK package:

```
approov sdk -packageID approov.js.zip -getClientPackage approov.js.zip
```

This writes the latest available web SDK package to the `approov.js.zip` file (or any path that you specify). Unzip the file and copy the resulting Approov web SDK Javascript file, `approov.js`, into your project and load it as part of your web app:

```html
<script type="module" src="./approov.js"></script>
```

## USING THE APPROOV WEB SDK

Add the following code to your app implementation to import the Approov web SDK:

```js
import { Approov, ApproovError, ApproovFetchError, ApproovServiceError, ApproovSessionError } from "./approov.js"
```

Add this function which initializes the Approov SDK, gets a Fingerprint result and requests an Approov token as required:

```js
async function fetchApproovToken(api) {
  try {
    // Try to fetch an Approov token
    let approovToken = await Approov.fetchToken(api, {})
    return approovToken
  } catch (error) {
    if (error instanceof ApproovSessionError) {
      // If Approov has not been initialized or the Approov session has expired, initialize and start a new one
      await Approov.initializeSession({
        approovHost: 'web-1.approovr.io',
        approovSiteKey: 'your-Approov-site-key',
        fingerprintPublicAPIKey: 'your-Fingerprint-public-API-key',
      })
      // Get a fresh Fingerprint result
      let result = await fpPromise.then(fp => fp.get())
      // Fetch the Approov token
      let approovToken = await Approov.fetchToken(api, {fingerprintIDResult: result})
      return approovToken
    } else {
      throw error
    }
  }
}
```

Customize the function using your Approov site key and Fingerprint public API key to replace `'your-Approov-site-key'` and `'your-Fingerprint-public-API-key'`, respectively.

Finally, modify the location in your code that generates the request headers to include an Approov token, for example change your function that includes a Fingerprint token in the headers, to fetch and include an Approov token instead:

```js
async function addRequestHeaders() {
  let headers = new Headers()
  // Add some headers here
  // ...
  // Then fetch and add the Approov token
  try {
    let approovToken = await fetchApproovToken('your-API-domain')
    headers.append('Approov-Token', approovToken)
  } catch (error) {
    console.error(error)
  }
  return headers
}
```

Customize the function above by using the domain you would like to protect with Approov in place of `'your-API-domain'`.

## ERROR TYPES

The `Approov.fetchToken` function may throw specific errors to provide additional information:

* `ApproovFetchError` Any error thrown by the `fetch` call made to perform a request to the Approov service. This
    indicates that there was a communication or network issue.
* `ApproovServiceError` An error reported by the Approov service, such as missing or malformed elements in the underlying
    request. The `errors` property contains additional information.
* `ApproovSessionError` The Approov session has not been initialized or has expired. A call to `Approov.initializeSession`
    should be made.
* `ApproovError` Any other error thrown during an Approov web SDK call.

## SETTING UP API PROTECTION

To actually protect your APIs there are some further steps:

* The Approov service needs to be set up to provide tokens for your API.
* Your API server needs to perform an Approov token check in addition to the steps in this frontend guide. Various [Backend API Quickstarts](https://approov.io/resource/quickstarts/#backend-api-quickstarts) are available to suit your particular situation depending on the backend technology used.
* Any Fingerprint visitor ID check in your API server needs to be converted to use the embedded Fingerprint result contained in the Approov token. The Approov service performs the call to the Fingerprint service to obtain the result, so your API backend does not need to.

## APPROOV SERVICE SETUP

The Approov service setup steps require access to the [Approov CLI](https://approov.io/docs/latest/approov-cli-tool-reference/), please follow the [Installation](https://approov.io/docs/latest/approov-installation/) instructions.

### ADDING API DOMAINS

In order for the Approov service to provide Approov tokens for particular API domains it is necessary to inform Approov about these. Execute the following command to add and web-enable the domain, replacing `your.domain` with the name of your API domain that should be protected with Approov:

```
approov api -add your.domain -allowWeb
```

### ADDING A FINGERPRINT SUBSCRIPTION

A Fingerprint subscription can be added by specifying the subscription region and by providing a valid public API key and secret API key. The following command adds a subscription in the Rest-of-the-World (RoW) region leaving all other settings at their default values:

```
approov web -fingerprint -add your-Fingerprint-public-API-key -secret your-Fingerprint-secret-API-key> -region RoW
```

To change a subscription you simply add it again with all the properties required for the changed subscription. Each addition of the same public API key completely overwrites the previously stored entry.

You are now set up to request and receive Approov tokens.

## CHECKING IT WORKS

Your Approov onboarding email should contain a link allowing you to access [Live Metrics Graphs](https://approov.io/docs/latest/approov-usage-documentation/#metrics-graphs). After you've run your web app with Approov integration you should be able to see the results in the live metrics within a minute or so.

The Approov CLI can check Approov token validity and display the claims. Open the browser developers tools and from the network tab grab the Approov token from the request header `Approov-Token` and then check it with:

```
approov token -check your-Approov-token
```

## OTHER CONSIDERATIONS

When adding Approov with Fingerprint into your own web app you may want to address some of the following points:

### API Domains

Remember to do an audit of your API to check which end-points should be enabled for web access. When necessary, extend the backend token check to differentiate between mobile app and web app tokens and use that to restrict the access to more sensitive end-points. Once the backend is ready, enable the Approov web protection by adding the `-allowWeb` flag whenever you [register or re-register](https://approov.io/docs/latest/approov-web-protection-integration/#enable-web-protection-for-an-api) an API with the Approov CLI.

### Changing Your API Backend

The Shapes example app uses the API endpoint `https://shapes.approov.io/v3/shapes` hosted on Approov's servers. You can find the code for it in this [Github repo](https://github.com/approov/quickstart-nodejs-koa_shapes-api).

If you want to integrate Approov into your own web app you will need to [integrate](https://approov.io/docs/latest/approov-usage-documentation/#backend-integration) an Approov token check in the backend. Since the Approov token is simply a standard [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) this is usually straightforward.

Check the [Backend API Quickstarts](https://approov.io/resource/quickstarts/#backend-api-quickstarts) examples that provide a detailed walk-through for specific programming languages and frameworks.

### Content Security Policy

In the `content-src` policy of your current web app you will need to add the domains for Approov and Fingerprint APIs:

```
connect-src https://your-domains.com https://web-1.approovr.io/ https://api.sjpf.io/ https://api.fpjs.io/;
```

You can check the Content Security Policy for your site [here](https://csp-evaluator.withgoogle.com/) or test it in conjunction with all the other security headers [here](https://securityheaders.com).

## FURTHER OPTIONS

Please also see the full documentation of the [Approov Web Protection Integration](https://approov.io/docs/latest/approov-web-protection-integration/).

### Token Binding

If want to use [Token Binding](https://approov.io/docs/latest/approov-web-protection-integration/#web-protection-token-binding) then pass the data to be used for binding as follows:

```js
const payload = new TextEncoder().encode(data)
Approov.fetchToken(api, {fingerprintIDResult: result, payload: payload}))
```

This results in the SHA-256 hash of the passed data to be included as the `pay` claim in any Approov tokens issued until a new value for the payload is passed to a call to `Approov.fetchToken`. Note that you should select a value that does not typically change from request to request, as each change requires a new Approov token to be fetched.
