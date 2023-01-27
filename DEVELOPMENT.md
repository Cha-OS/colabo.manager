# Run

```sh
yarn
tsc
python3 -m http.server 8000
```

Open: http://localhost:8000
authorize
Add the sheet id in a form of: http://localhost:8000/#<sheet_id>
+ example: http://localhost:8000/#11rP-55rYpbHI6OWq7caJIclTQuQKIxbaU2cSTyDROrs

Examples
+ Zhenia's grant: Translation and Language Contact in Literature (TLCL) - Gantt
	+ https://docs.google.com/spreadsheets/d/1bqtivv_i8x7IjWid7AoXhkiZFaVtGNkdNhzwah78FDk/edit#gid=0

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

This table works: `11rP-55rYpbHI6OWq7caJIclTQuQKIxbaU2cSTyDROrs`

http://localhost:8000/#11rP-55rYpbHI6OWq7caJIclTQuQKIxbaU2cSTyDROrs

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