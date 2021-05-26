let fpPromise

window.addEventListener('load', (event) => {
  const navbar = document.getElementById('toggle-navbar')

  navbar.addEventListener('click', (event) => {
      toggleNavbar('example-collapse-navbar')
  })

  const helloButton = document.getElementById('hello-button')
  helloButton.addEventListener('click', (event) => {
      fetchHello()
  })

  const shapeButton = document.getElementById('shape-button')
  shapeButton.addEventListener('click', (event) => {
      fetchShape()
  })

  fpPromise = initFingerprintJS()
})

const API_VERSION = "v1"
const API_DOMAIN = "shapes.approov.io"
const API_BASE_URL = "https://" + API_DOMAIN

// Check the Dockerfile to see how place holders are replaced during the
// Docker image build.
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

function addRequestHeaders() {
  return fetchFingerprintJsData()
    .then(fingerprintJsData => {
      return btoa(JSON.stringify(fingerprintJsData))
    })
    .then(fingerprintJsToken => {
      return new Headers({
        'Api-Key': 'your-api-key-goes-here',
        'FingerprintJS-Token': fingerprintJsToken
      })
    })
}

function makeApiRequest(path) {
  hideFromScreen()

  return addRequestHeaders()
    .then(headers => {
      return fetch(API_BASE_URL + '/' + path, { headers: headers })
    })
}

function fetchHello() {
  makeApiRequest(API_VERSION + '/hello')
    .then(response => {
      return handleApiResponse(response)
    })
    .then(data => {
      document.getElementById('start-app').classList.add("hidden")
      document.getElementById('hello').classList.remove("hidden")
    })
    .catch(error => {
      handleApiError('Fetch from ' + API_VERSION + '/hello failed', error)
    })
}

function fetchShape() {
  makeApiRequest(API_VERSION + '/shapes')
    .then(response => {
      return handleApiResponse(response)
    })
    .then(data => {

      if (data.status >= 400 ) {
        document.getElementById('confused').classList.remove("hidden")
        return
      }

      let node = document.getElementById('shape')
      node.classList.add('shape-' + getRandomShape())
      node.classList.remove("hidden")
    })
    .catch(error => {
      handleApiError('Fetch from ' + API_VERSION + '/shapes failed', error)
    })
}

function handleApiResponse(response) {
  document.getElementById('spinner').classList.add("hidden")

  if (!response.ok) {
    console.debug('Error Response', response)
    console.debug('Error Response Body Text', response.text())
    throw new Error(response.status + ' ' + response.statusText)
  }

  return response.json();
}

function handleApiError(message, error) {
  document.getElementById('spinner').classList.add("hidden")

  console.debug(message, error)

  let node = document.getElementById('confused')
  node.lastChild.innerHTML = error
  node.classList.remove("hidden")
}

function getRandomShape() {
  const shapes = [
    "circle",
    "rectangle",
    "square",
    "triangle",
  ]

  const randomIndex = Math.floor(Math.random() * shapes.length);
  return shapes[randomIndex];
}

function hideFromScreen() {
  document.getElementById('start-app').classList.add("hidden");
  document.getElementById('confused').classList.add("hidden");
  document.getElementById('hello').classList.add("hidden");
  document.getElementById('shape').className = "hidden"
  document.getElementById('spinner').classList.remove("hidden")
}

function toggleNavbar(collapseID) {
  document.getElementById(collapseID).classList.toggle("hidden");
  document.getElementById(collapseID).classList.toggle("block");
}
