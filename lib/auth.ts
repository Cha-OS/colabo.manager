/*globals gapi, google */
/*jshint esversion: 6 */
/*jshint unused:true */
/*exported login */
/* Google API Login promise with built-in dialog box
<code>
login(MY_KEY, MY_CLIENTID, [{
  'gapi':'drive',
  'discovery': 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'scopes': [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ]
},{
  'chart':'gantt'
}]).then...
</code>
*/
export let login = (apiKey, clientId, apis) => {
    let blockUntilDOMReady = () => new Promise(resolve => {
        // Block on document being fully ready, in case we need to build a login button
        if (document.readyState === 'complete') {
            console.info(`document.readyState=${document.readyState}`);
            resolve();
            return;
        }
        let onReady = () => {
            resolve();
            document.removeEventListener('DOMContentLoaded', onReady, true);
            window.removeEventListener('load', onReady, true);
        };
        document.addEventListener('DOMContentLoaded', onReady, true);
        window.addEventListener('load', onReady, true);
    });
    let gapiLoad = () => new Promise(resolve => {
        console.info('gapi.load');
        // Promise not implemented in gapi.load
        gapi.load('client:auth2:signin2', resolve);
    });
    let chartLoad = (apis) => {
        console.info('chartLoad');
        let charts = apis.filter(api => api.chart).map(api => api.chart);
        if (charts.length > 0) {
            console.info('google.charts.load');
            return google.charts.load('current', {
                'packages': [].concat(charts)
            });
        }
    };
    let signinDialog = () => new Promise(resolve => {
        console.info('signinDialog');
        const SIGN_IN_ID = 'google-signin-button';
        // tell it is not default `Element`, but `HTMLInputElement`
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal
        let dialog = <HTMLDialogElement>document.querySelector('#' + SIGN_IN_ID); // ok that it may be empty
        let signinCheck = isSignedIn => {
            console.info(`signinCheck(${isSignedIn})`);
            if (isSignedIn) {
                if (dialog) {
                    if (dialog.open) {
                        dialog.close();
                    }
                    dialog.remove();
                    console.log('closed and removed dialog with sign-in button.');
                }
                resolve();
            }
        };
        let gai = gapi.auth2.getAuthInstance();
        console.info('listening for signed-in user change');
        gai.isSignedIn.listen(signinCheck);
        console.info('checking for already signed-in user');
        if (gai.isSignedIn.get()) {
            signinCheck(true);
            return;
        }
        console.info('user not signed-in, build the button.');
        if (!dialog) {
            console.info('Constructing sign-in button in modal dialog.');
            dialog = document.createElement('dialog');
            document.body.appendChild(dialog);
            dialog.id = SIGN_IN_ID;
            gapi.signin2.render(SIGN_IN_ID, {
                'longtitle': true
            });
        }
        dialog.showModal();
    });
    return Promise.resolve()
        .then(() => {
        // https://developer.mozilla.org/en-US/docs/Web/API/console/assert
        console.assert(typeof window.gapi != "undefined", `Expected window.gapi from '<script src="https://apis.google.com/js/api.js"></script>'`);
        console.group();
        console.time('Auth');
        console.info('Auth:beginning.');
    })
        // blockUntilDOMReady must be before gapi.client.init because init needs an iframe
        .then(() => Promise.all([blockUntilDOMReady(), gapiLoad(), chartLoad(apis)]))
        .then(() => gapi.client.init({
        apiKey: apiKey,
        clientId: clientId,
        discoveryDocs: apis.filter(api => api.discovery).map(api => api.discovery),
        // https://mariusschulz.com/blog/downlevel-iteration-for-es3-es5-in-typescript
        // https://stackoverflow.com/questions/33464504/using-spread-syntax-and-new-set-with-typescript/33464709
        // we had to use `"downlevelIteration": true` in the `tsconfig.json` because of this
        // which slows down the compiled code
        scope: [...new Set(apis.filter(api => api.scopes).map(api => api.scopes.join(' ')))].join(' ')
    }))
        .then(signinDialog)
        .then(() => {
        console.info('Fully authorized and loaded libs, beginning app');
        console.timeEnd('Auth');
        console.groupEnd();
    });
};
//# sourceMappingURL=auth.js.map