# Run

```sh
yarn
tsc
python3 -m http.server 8000
```

Open: http://localhost:8000
authorize
Add the sheet id in a form of: http://localhost:8000/#<sheet_id>

## Examples

Colabo.Manager - Gantt - Simple Demo: 

+ http://localhost:8000/#11rP-55rYpbHI6OWq7caJIclTQuQKIxbaU2cSTyDROrs
+ https://docs.google.com/spreadsheets/d/11rP-55rYpbHI6OWq7caJIclTQuQKIxbaU2cSTyDROrs/edit?resourcekey=0-tKeTp24eL2UAEpwt6c0sqQ#gid=0

Zhenia's grant: Translation and Language Contact in Literature (TLCL) - Gantt

+ https://docs.google.com/spreadsheets/d/1bqtivv_i8x7IjWid7AoXhkiZFaVtGNkdNhzwah78FDk/edit#gid=0
+ http://localhost:8000/#1bqtivv_i8x7IjWid7AoXhkiZFaVtGNkdNhzwah78FDk

# Styling

Removing scrollbar
```html
<main class="mdl-layout__content" style="
    overflow: hidden; /* Hide scrollbars */
">
```

# Info

the new GIS authentication and authorization is based on

https://developers.google.com/sheets/api/quickstart/js#prereqs

http://localhost:8000/

Google Cloud Project:
+ `colabo-manager`
+ https://console.cloud.google.com/cloud-resource-manager?pli=1&project=colabo-manager

Google APIs
+ [Enable Google Workspace APIs](https://developers.google.com/workspace/guides/enable-apis)
+ https://console.cloud.google.com/apis/dashboard?project=colabo-manager
	+ Google Drive API					
	+ Google Sheets API					

Creadentials
+ https://console.cloud.google.com/apis/credentials?authuser=0&project=colabo-manager

OAuth consent screen
+ https://console.cloud.google.com/apis/credentials/consent?project=colabo-manager

Gantt Charts
+ [Official - Gantt Charts](https://developers.google.com/chart/interactive/docs/gallery/ganttchart)

# Errors

[Google API authentication: Not valid origin for the client](https://stackoverflow.com/questions/42566296/google-api-authentication-not-valid-origin-for-the-client)

# References

* https://developers.google.com/chart/interactive/docs/gallery/ganttchart
* https://developers.google.com/sheets/api/quickstart/js
* https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get

# Info Colabo

1) https://github.com/cha-OS/colabo.manager
2) koristi Google API za pristup spreadsheet-u
3) koristi Google API za generisanje gantt-a (kao drawing lib, kao bilboard.js, ok?
4) kreirah Google API kljuceve i sve
5) kreirah nas server https://manager.colabo.space/

И овдје имаш примјер: https://manager.colabo.space/#1ALE236gG3fn2Wakk3oFSYyuNaanbs-wv5q8GHJXGISU

# Legacy

## Running on Google Cloud

`gcloud app deploy -q --project ezgantt --version 1 --verbosity=info app.yaml`

* app id: ezgantt
* api key, client id, client secret: see JS files.

+ In your gCloud project add APIs
    + Google Sheets API
    + Google Drive API
+ create both type of  credentials
    + Simple: API key
    + Authorized: OAuth 2.0 credentials

## Quotes

> "I think ezgantt is a great tool for small-medium projects, 
> it's easy to learn (took me minutes to get a good chart) and maintain."

