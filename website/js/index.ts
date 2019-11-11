/* globals gapi, google, login */
/*jshint esversion: 6 */
/*jshint unused:true */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// we have to say `.js` extension explicitly here as browser would complain
// https://github.com/microsoft/TypeScript/issues/16577
import { login } from './auth.js';
// Helper functions
let daysToMilliseconds = days => {
    return parseInt(days, 10) * 24 * 60 * 60 * 1000;
}, strToMS = str => {
    switch (str.slice(-1)) {
        case 'w':
            return daysToMilliseconds(str) * 7;
        case 'm':
            return daysToMilliseconds(str) * 7 * 4;
        case 'q':
            return daysToMilliseconds(str) * 7 * 4 * 3;
        case 'd':
        /* falls through */
        default:
            return daysToMilliseconds(str);
    }
};
const GANTT_SHEET_NAME = 'gantt';
const COLUMN_TASK_ID = 'taskid';
const COLUMN_TASK_NAME = 'taskname';
const COLUMN_RESOURCE = 'resource';
const COLUMN_START_DATE = 'startdate';
const COLUMN_END_DATE = 'enddate';
const COLUMN_DURATION = 'duration';
const COLUMN_PERCENT_COMPLETE = 'percentcomplete';
const COLUMN_DEPENDENCIES = 'dependencies';
const IS_PUBLIC = window.location.toString().includes('colabo.space');
// place proper keys from `colabo.space-infrastructure-private/keys/google.md`
// NOTE: But NOT IN TypeScript file, but in COMPILED JS file
const API_KEY = IS_PUBLIC ? 'AIzaSyDfw7XQi9rLIpcaMtJ-HYg-bHi3zXuY2NI' : 'AIzaSyAw0yf380IIJSDJeuDhJjWgYIO0ma6ZCbg';
const CLIENT_ID = IS_PUBLIC ? '1012833906465-p0bu6lel8ib0bapv07lj2321ookosl6u.apps.googleusercontent.com' : '918743316759-e79mcr3rks3t8291qopi82qb9i8ht5l8.apps.googleusercontent.com';
const PUBLIC_PRIVATE_DOC = ['1zYmWtZh0gNxhtFMC0YVwBwzfH9Iy_7viTFGo2Ot5B8s', '1ZkDfbfj3G_CONE22ap82dpgnOxQ9L33CQ5K74ZVPzrA'];
const APIS = [{
        'gapi': 'spreadsheets',
        'discovery': 'https://sheets.googleapis.com/$discovery/rest?version=v4',
        'scopes': ['https://www.googleapis.com/auth/spreadsheets.readonly']
    }, {
        'gapi': 'drive',
        'discovery': 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
        'scopes': [
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.metadata.readonly'
        ]
    }, {
        'chart': 'gantt'
    }];
// replace reference from public sheet to private sheet
if (!IS_PUBLIC) {
    let anchors = document.getElementsByTagName("a");
    for (let i = 0; i < anchors.length; i++) {
        anchors[i].href = anchors[i].href.replace(PUBLIC_PRIVATE_DOC[0], PUBLIC_PRIVATE_DOC[1]);
    }
}
// returns spreadshitID as a promise
function getSpreadshitId() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Login finished, starting app init.');
        return new Promise(resolve => {
            let initFunction = () => {
                // get the google spreadsheet id
                let hash = location.hash.replace('#', '').replace(/[?&].*/, '');
                if (hash) {
                    document.getElementById('sheet').setAttribute('href', 'https://docs.google.com/spreadsheets/d/' + hash + '/edit');
                    resolve(hash);
                }
                else {
                    document.getElementById('instructions-dialog').showModal();
                    // reject(); Never reject, never resolve.
                }
            };
            // check and wait document finish loading
            if (document.readyState === 'complete') {
                initFunction();
            }
            else {
                document.addEventListener("DOMContentLoaded", initFunction);
            }
        });
    });
}
// returns google Spreadsheet as a promise
function getSpreadsheet(sheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('readGanttData', sheetId);
        return gapi.client.sheets.spreadsheets.get({
            'spreadsheetId': sheetId,
            'includeGridData': true,
            // Gets excess data from other tabs, but removes a round trip.  
            'fields': 'properties/title,sheets(properties(sheetId,title,gridProperties),data(rowData(values(formattedValue))))'
        });
    });
}
// returns google Sheet as a promise
function getSheet(resp) {
    return __awaiter(this, void 0, void 0, function* () {
        let spreadsheet = resp.result;
        console.log('spreadsheet', spreadsheet);
        document.getElementById('pageTitle').innerHTML = spreadsheet.properties.title;
        // console.log('Found ' + spreadsheet.sheets.length + ' worksheets.');
        return spreadsheet.sheets.find(sheet => sheet.properties.title.toLowerCase().includes(GANTT_SHEET_NAME));
    });
}
/** returns an array of dictionaries/hashes
 * row is present only if at least one column is present
 * each row is a dictionary with columns (trimmed and lowecased) as name, and cell values as values
*/
function getRawRows(sheet) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sheet) {
            Promise.reject('Unable to find worksheet with "gantt" in the name.');
        }
        // console.log('displayGantt sheet', sheet);
        // take a table's first header row and use it as object property names
        let rowData = sheet.data[0].rowData;
        let result = [];
        let rowHeaders = rowData[0];
        for (let rowNum = 1; rowNum < rowData.length; rowNum++) {
            let newRow = {};
            let newRowHasData = false;
            let rowDatum = rowData[rowNum];
            for (let colNum = 0; rowDatum && rowDatum.values && colNum < rowDatum.values.length; colNum++) {
                // convert to lower case and remove spaces
                // or rather, remove anything that is not in r/a-z0-9/
                // which means we can add spaces and capitals in gantt sheet column names
                let headerName = rowHeaders.values[colNum].formattedValue.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
                if (rowDatum.values[colNum] &&
                    (typeof rowDatum.values[colNum].formattedValue !== 'undefined')) {
                    // Leave empty values missing, everything else is a string.
                    newRow[headerName] = '' + rowDatum.values[colNum].formattedValue;
                    newRowHasData = true;
                }
            }
            if (newRowHasData) {
                result.push(newRow);
            }
        }
        return result;
    });
}
function displayGantt(rows) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('displayGantt converted rows', rows);
        // create google DataTable
        let data = new google.visualization.DataTable();
        // create the column names that the Google Gantt chart expects
        data.addColumn('string', 'Task ID');
        data.addColumn('string', 'Task Name');
        data.addColumn('string', 'Resource');
        data.addColumn('date', 'Start Date');
        data.addColumn('date', 'End Date');
        data.addColumn('number', 'Duration');
        data.addColumn('number', 'Percent Complete');
        data.addColumn('string', 'Dependencies');
        // an array of rows where
        // each row is an array of column values (no column names, or anything fancy)
        let allRows = [];
        let ids = {};
        rows.filter(row => row[COLUMN_TASK_ID]).forEach(row => {
            // an array of column values (no column names, or anything fancy)
            let rowData = [];
            // ID (lower case and removed spaces all through the id)
            // warn if row[COLUMN_TASK_ID] is duplicated
            let id = row[COLUMN_TASK_ID].toLowerCase().replace(/[^a-z0-9]/g, '').trim();
            if (ids[id]) {
                alert('Duplicate task id:' + id);
            }
            ids[id] = true;
            rowData.push(id);
            // Name
            // skipping commented out rows
            if (row[COLUMN_TASK_NAME] && row[COLUMN_TASK_NAME].startsWith('#')) {
                console.log('Skipping row ' + id + ' with name:' + row[COLUMN_TASK_NAME]);
                return;
            }
            rowData.push(row[COLUMN_TASK_NAME]);
            // Resource
            rowData.push(row[COLUMN_RESOURCE] ? row[COLUMN_RESOURCE].toLowerCase().trim() : null);
            // Start (slash hack for local timezone)
            // `YYYY-MM-DD` -> `YYYY/MM/DD`
            rowData.push(row[COLUMN_START_DATE] ? new Date(row[COLUMN_START_DATE].replace(/-/g, '/')) : null);
            // End (slash hack for local timezone)
            rowData.push(row[COLUMN_END_DATE] ? new Date(row[COLUMN_END_DATE].replace(/-/g, '/')) : null);
            // report end before start
            if (row[COLUMN_START_DATE] && row[COLUMN_END_DATE] && (new Date(row[COLUMN_START_DATE])) > (new Date(row[COLUMN_END_DATE]))) {
                alert('Illogical, start date later than end date for id:' + id);
            }
            // Duration
            rowData.push(row[COLUMN_DURATION] ? strToMS(row[COLUMN_DURATION]) : null);
            // Percent
            rowData.push(row[COLUMN_PERCENT_COMPLETE] ? (+row[COLUMN_PERCENT_COMPLETE].replace(/\D\./g, '')) : 0);
            // Dependencies
            rowData.push(row[COLUMN_DEPENDENCIES] ? row[COLUMN_DEPENDENCIES].toLowerCase().replace(/[^a-z0-9,]/g, '') : null);
            console.log('id,name,resource,start,end,dur,pct,dep', rowData);
            // add new row to others
            allRows.push(rowData);
        });
        // Check for missing dependencies that would break the chart.
        allRows.filter(row => row.dependencies).forEach(row => {
            row.dependencies.split(',').forEach(dep => {
                let dep2 = dep.trim();
                if (dep2 && !ids[dep2]) {
                    alert('Task:' + row.id + ' is missing dependency:' + dep2);
                }
            });
        });
        // add all raw rows into google DataTable
        data.addRows(allRows);
        // set Gantt Chart Options
        let options = {
            gantt: {
                trackHeight: 30,
                defaultStartDateMillis: new Date(),
                criticalPathEnabled: true,
                criticalPathStyle: {
                    stroke: '#e64a19',
                    strokeWidth: 5
                }
            }
        };
        // drawing Google Gantt Chart
        console.log('Drawing chart');
        // google.visualization.Gantt not supported in @types
        // let chart:Gantt = google.visualization.Gantt(document.getElementById('chart_div'));
        let chart = new google.visualization.Gantt(document.getElementById('chart_div'));
        chart.draw(data, options);
    });
}
login(API_KEY, CLIENT_ID, APIS)
    .then(getSpreadshitId)
    .then(getSpreadsheet)
    .then(getSheet)
    .then(getRawRows)
    .then(displayGantt)
    .catch(error => {
    console.error("General Error", error);
    alert('App error, see console.');
});
// TODO: Set up listeners
/*
google.visualization.events.addListener(chart, 'click', targetId => {
  console.log('Clicked on:' + targetId);
});

google.visualization.events.addListener(chart, 'select', () => {
  console.log(JSON.stringify(chart.getSelection()));
});
*/ 
//# sourceMappingURL=index.js.map