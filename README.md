# Colabo.Manager

It helps viewing a Google Spreadsheet as a Gantt Chart

Repo: http://github.com/cha-OS/colabo.manager

(NOTE: The project originates from the Google ezGantt project: https://github.com/google/ezgantt)

Colabo.Manager uses public Google Chart and Google Drive JavaScript APIs, so the same users who can view the Spreadsheet can see the Gantt chart.

To **try it**, go to https://manager.colabo.space/#/#1zYmWtZh0gNxhtFMC0YVwBwzfH9Iy_7viTFGo2Ot5B8s where the demo sheet will be visualized as a gantt chart.

To **use it** yourself, make a copy of the demo sheet and start adding tasks!

# Google Sheet parameters

## Sheet name

Sheet name shold be named as **`gantt`**

If you need to provide a random name of the sheet please [create a new issue](https://github.com/Cha-OS/colabo.manager/issues)

## Column names

Column names in the `gantt` google sheet have to be properly set to be matched with the Colabo.Manager and converted into the Gantt chart.

The provided names in this doc are the final names as the Colabo.Manager sees them. However, you are free to change letter cases and introduce spaces in it, and add additional 'formating' (like, `-`, `_`). For example `taskid` is same as `_Task-ID`.

If you need to provide random column names, or different behavior of column conversion, please [create a new issue](https://github.com/Cha-OS/colabo.manager/issues).

### taskid

The column **`taskid`** describes the id of the task, Each task has to hava a unique name.

### taskname

The column **`taskname`** describes the name of the task. This is what will be visible in the gantt chart.

If you prefix the task name with **`#`** it will be skipped.

### resource

The column **`resource`** describes the resource that will perform the task. The resource is lower-cased and it can contain spaces which will be trimmed. For example `chaos` is same as ` Cha OS `.

**Colors** of the gantt labels and tasks will identify the resource responsible for the work. Colors will be assigned randomly but uniquelly to each different resource.

### startdate

The column **`startdate`** sets the starting date of the task. It is in the form: `2018-08-26`.

**Note**: The fields `startdate` and `enddate` are excluding the field `duration`.

### enddate

The column **`enddate`** sets the finishing date of the task. It is in the form: `2018-08-26`.

**Note**: The fields `startdate` and `enddate` are excluding the field `duration`.

### duration

**Note**: The field `duration` is excluding the fields `startdate` and `enddate`.

The column **`duration`** tells the lenght of the task. It is the combination of a number and the period type:
+ **`w`**: week
+ **`m`**: month
+ **`q`**: quartal
+ **`d`** (*default*): day

`2w` - two weeks, and `5d` (or `5`) are 5 days

### percentcomplete

The column **`percentcomplete`** tells how much of the task is finished. 

Anything that is not digit will be removed. Both `75` and `75%` tells that `75%` percentages of the task is finished. This will be communicated on the task coloring: with a bit darker color for finished part of the task, and lighter color for unfinished part of the task. The granularity of the percentage completed is low. 

### dependencies

The column **`dependencies`** tells which tasks the current task depends on. It is a list of task ids, separated with comma. All rules of normalization for `taskid` are also valid here: ` A_do it :) , A_GENerate ` is equal as `a_doit,a_generate`

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