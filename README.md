# Colabo.Manager

Repo: http://github.com/cha-OS/colabo.manager

(NOTE: Originates from: https://github.com/google/ezgantt)

View a Google Spreadsheet as a Gantt Chart

Colabo.Manager uses public Google Chart and Google Drive JavaScript APIs, so the same users who can view the Spreadsheet can see the Gantt chart.

To try it, go to https://manager.colabo.space/#/#1zYmWtZh0gNxhtFMC0YVwBwzfH9Iy_7viTFGo2Ot5B8s where the demo sheet will be visualized as gantt chart.

To use it yourself, make a copy of the demo sheet and start adding tasks!

# References

* https://developers.google.com/chart/interactive/docs/gallery/ganttchart
* https://developers.google.com/sheets/api/quickstart/js
* https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get


# Info Colabo

1) гант креатор , google demo, OS, klonirah kod nas https://github.com/cha-OS/colabo.manager
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