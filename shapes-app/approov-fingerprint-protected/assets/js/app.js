
import { APPROOV_ATTESTER_DOMAIN, SHAPES_API_KEY, APPROOV_SITE_KEY, FINGERPRINT_PUBLIC_API_KEY } from "/config.js"
import { Approov, ApproovError, ApproovFetchError, ApproovServiceError, ApproovSessionError } from "./approov.js"

let fpPromise

window.addEventListener('load', (event) => {
  const navbar = document.getElementById('toggle-navbar')
  navbar.addEventListener('click', (event) => toggleNavbar('example-collapse-navbar'))

  const helloButton = document.getElementById('hello-button')
  helloButton.addEventListener('click', (event) => fetchHello())

  const shapeButton = document.getElementById('shape-button')
  shapeButton.addEventListener('click', (event) => fetchShape())

  fpPromise = initFingerprint()
})

const API_VERSION = "v3"
const API_DOMAIN = "shapes.approov.io"
const API_BASE_URL = "https://" + API_DOMAIN

function initFingerprint() {
  // Initialize the Fingerprint agent
  const fpPromise = import('https://fpjscdn.net/v3/' + FINGERPRINT_PUBLIC_API_KEY)
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
    if (error instanceof ApproovSessionError) {
      // If Approov has not been initialized or the Approov session has expired, initialize and start a new one
      await Approov.initializeSession({
        approovHost: APPROOV_ATTESTER_DOMAIN,
        approovSiteKey: APPROOV_SITE_KEY,
        fingerprintPublicAPIKey: FINGERPRINT_PUBLIC_API_KEY,
      })
      // Get a fresh Fingerprint result
      let result = await getFingerprintData()
      // Fetch the Approov token
      let approovToken = await Approov.fetchToken(api, {fingerprintIDResult: result})
      return approovToken
    } else {
      throw error
    }
  }
}

async function addRequestHeaders() {
  let headers = new Headers({
    'Accept': 'application/json', // fix the default being anything "*/*"
    'Api-Key': SHAPES_API_KEY,
  })
  try {
    let approovToken = await fetchApproovToken(API_DOMAIN)
    headers.append('Approov-Token', approovToken)
  } catch (error) {
    console.error(error)
  }
  return headers
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
