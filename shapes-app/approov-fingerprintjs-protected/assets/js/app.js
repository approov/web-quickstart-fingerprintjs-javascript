let fpPromise

window.addEventListener('load', (event) => {
  const navbar = document.getElementById('toggle-navbar')
  navbar.addEventListener('click', (event) => toggleNavbar('example-collapse-navbar'))

  const helloButton = document.getElementById('hello-button')
  helloButton.addEventListener('click', (event) => fetchHello())

  const shapeButton = document.getElementById('shape-button')
  shapeButton.addEventListener('click', (event) => fetchShape())

  fpPromise = initFingerprintJS()
})

const API_VERSION = "v2"
const API_DOMAIN = "shapes.approov.io"
const API_BASE_URL = "https://" + API_DOMAIN
const APPROOV_ATTESTER_URL = 'https://web-1.approovr.io/attest'

// Check the Dockerfile to see how place holders are replaced during the
// Docker image build.
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

function makeApiRequest(path) {
  hideFromScreen()

  return addRequestHeaders()
    .then(headers => fetch(API_BASE_URL + '/' + path, { headers: headers }))
}

function fetchHello() {
  makeApiRequest(API_VERSION + '/hello')
    .then(response => handleApiResponse(response))
    .then(data => {
      document.getElementById('start-app').classList.add("hidden")
      document.getElementById('hello').classList.remove("hidden")
    })
    .catch(error => handleApiError('Fetch from ' + API_VERSION + '/hello failed', error))
}

function fetchShape() {
  makeApiRequest(API_VERSION + '/shapes')
    .then(response => handleApiResponse(response))
    .then(data => {

      if (data.status >= 400 ) {
        document.getElementById('confused').classList.remove("hidden")
        return
      }

      let node = document.getElementById('shape')
      node.classList.add('shape-' + data.shape.toLowerCase())
      node.classList.remove("hidden")
    })
    .catch(error => handleApiError('Fetch from ' + API_VERSION + '/shapes failed', error))
}

function handleApiResponse(response) {
  document.getElementById('spinner').classList.add("hidden")

  if (!response.ok) {
    console.debug('Error Response', response)
    console.debug('Error Response Body Text', response.text())
    throw new Error(response.status + ' ' + response.statusText)
  }

  document.getElementById('success').classList.remove("hidden")

  return response.json();
}

function handleApiError(message, error) {
  document.getElementById('spinner').classList.add("hidden")

  console.debug(message, error)

  let node = document.getElementById('confused')
  node.lastChild.innerHTML = error
  node.classList.remove("hidden")
}

function hideFromScreen() {
  document.getElementById('start-app').classList.add("hidden");
  document.getElementById('confused').classList.add("hidden");
  document.getElementById('hello').classList.add("hidden");
  document.getElementById('shape').className = "hidden"
  document.getElementById('success').className = "hidden"
  document.getElementById('spinner').classList.remove("hidden")
}

function toggleNavbar(collapseID) {
  document.getElementById(collapseID).classList.toggle("hidden");
  document.getElementById(collapseID).classList.toggle("block");
}
