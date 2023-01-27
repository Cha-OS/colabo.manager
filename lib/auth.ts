// import {google} from 'googleapis';
// import gapi from 'gapi';

/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '439062454058-baj3c5sdof9ub1n2l3hctc7qln0cubdp.apps.googleusercontent.com';
const API_KEY = 'AIzaSyC3Bc7pB9N2gJIDGzqdJjlkyPpSHBoBIIQ';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

const authorize_button = document.getElementById('authorize_button');
if(authorize_button) {
	authorize_button.style.visibility = 'hidden';
}
const signout_button = document.getElementById('signout_button')
if(signout_button) {
	signout_button.style.visibility = 'hidden';
}

/**
 * Callback after api.js is loaded.
 */
export function gapiLoaded() {
	console.log(`[gapiLoaded] started`);
	gapi.load('client', intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
	await gapi.client.init({
		apiKey: API_KEY,
		discoveryDocs: [DISCOVERY_DOC],
	});
	gapiInited = true;
	maybeEnableButtons();
}

declare const startWork: Function;

/**
 * Callback after Google Identity Services are loaded.
 */
export function gisLoaded() {
	console.log(`[gisLoaded] started`);
	tokenClient = google.accounts.oauth2.initTokenClient({
		client_id: CLIENT_ID,
		scope: SCOPES,
		callback: async (resp) => {
			if (resp.error !== undefined) {
				throw (resp);
			}
			document.getElementById('signout_button').style.visibility = 'visible';
			document.getElementById('authorize_button').innerText = 'Refresh';
			console.log(`Authenticated. Calling "startWork()"`);
			startWork();
		},
	});
	gisInited = true;
	maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
	if (gapiInited && gisInited) {
		document.getElementById('authorize_button').style.visibility = 'visible';
	}
}

/**
 *  Sign in the user upon button click.
 */
export function handleAuthClick() {

	if (gapi.client.getToken() === null) {
		// Prompt the user to select a Google Account and ask for consent to share their data
		// when establishing a new session.
		tokenClient.requestAccessToken({ prompt: 'consent' });
	} else {
		// Skip display of account chooser and consent dialog for an existing session.
		tokenClient.requestAccessToken({ prompt: '' });
	}
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
	const token = gapi.client.getToken();
	if (token !== null) {
		google.accounts.oauth2.revoke(token.access_token, () => console.log("[handleSignoutClick:done] Revoked"));
		// gapi.client.setToken('');
		gapi.client.setToken(token);
		document.getElementById('content').innerText = '';
		document.getElementById('authorize_button').innerText = 'Authorize';
		document.getElementById('signout_button').style.visibility = 'hidden';
	}
}
