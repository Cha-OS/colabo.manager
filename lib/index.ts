import "./auth.js";

interface GanttVisualization{
    Gantt(HTMLElement):void;
}
interface GanttChart{
	// https://developers.google.com/chart/interactive/docs/reference#datatable-class
    draw(data:google.visualization.DataTable, options:any);
}

interface RowData{
    [cellName: string] : string;
}

// we have to say `.js` extension explicitly here as browser would complain
// https://github.com/microsoft/TypeScript/issues/16577
// import { login } from './auth.js';
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

const RAW_ROW_ID = 'rawId';

const COLUMN_TASK_ID = 'taskid';
const COLUMN_TASK_NAME = 'taskname';
const COLUMN_RESOURCE = 'resource';
const COLUMN_START_DATE = 'startdate';
const COLUMN_END_DATE = 'enddate';
const COLUMN_DURATION = 'duration';
const COLUMN_PERCENT_COMPLETE = 'percentcomplete';
const COLUMN_DEPENDENCIES = 'dependencies';

const FIRST_ROW_ID = 2;

const IS_PUBLIC = window.location.toString().includes('colabo.space');

// OBSOLATED: `"You have created a new client application that uses libraries for user authentication or authorization that will soon be deprecated. New clients must use the new libraries instead; existing clients must also migrate before these libraries are deprecated. See the [Migration Guide](https://developers.google.com/identity/gsi/web/guides/gis-migration) for more information."`
// place proper keys from `colabo.space-infrastructure-private/keys/google.md`
// NOTE: But NOT IN TypeScript file, but in COMPILED JS file
const API_KEY = IS_PUBLIC ? 'AIzaSyDfw7XQi9rLIpcaMtJ-HYg-bHi3zXuY2NI' : 'AIzaSyC3Bc7pB9N2gJIDGzqdJjlkyPpSHBoBIIQ';
const CLIENT_ID = IS_PUBLIC ? '1012833906465-p0bu6lel8ib0bapv07lj2321ookosl6u.apps.googleusercontent.com' : '439062454058-baj3c5sdof9ub1n2l3hctc7qln0cubdp.apps.googleusercontent.com';
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
		// https://developers.google.com/chart/interactive/docs/gallery/ganttchart
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
async function getSpreadshitId(): Promise<string> {
    console.log('Login finished, starting app init.');
    return new Promise(resolve => {
        let initFunction = () => {
            // get the google spreadsheet id
            let hash: string = location.hash.replace('#', '').replace(/[?&].*/, '');
            if (hash) {
                document.getElementById('sheet').setAttribute('href', 'https://docs.google.com/spreadsheets/d/' + hash + '/edit');
                resolve(hash);
            }
            else {
                (<HTMLDialogElement>document.getElementById('instructions-dialog')).showModal();
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
}

// returns google Spreadsheet as a promise
async function getSpreadsheet(sheetId:string): Promise<gapi.client.Request<gapi.client.sheets.Spreadsheet>> {
    console.log('readGanttData', sheetId);
    const result: gapi.client.Request<gapi.client.sheets.Spreadsheet> = gapi.client.sheets.spreadsheets.get({
        'spreadsheetId': sheetId,
        'includeGridData': true,
        // Gets excess data from other tabs, but removes a round trip.  
        'fields': 'properties/title,sheets(properties(sheetId,title,gridProperties),data(rowData(values(formattedValue))))'
    });
	return result;
}

// returns google Sheet as a promise
async function getSheet(resp) {
    let spreadsheet:gapi.client.sheets.Spreadsheet = resp.result;
    console.log('spreadsheet', spreadsheet);
    document.getElementById('pageTitle').innerHTML = spreadsheet.properties.title;
    let sheet:gapi.client.sheets.Sheet = spreadsheet.sheets.find(sheet => {
		if (!sheet.properties.title) {
			console.error("[getSheet] sheet.properties.title is empty");
			return false;
		}
		sheet.properties.title.toLowerCase().includes(GANTT_SHEET_NAME)
		return sheet;
	});	

    if(!sheet){
        window.alert("[getSheet] We couldn't find the sheet with name '"+ GANTT_SHEET_NAME +"'")
    }
    return sheet;
}

/**
 * Normalizes an id. Removes all non alphanumeric characters, and lowecases all characters
 * @param id - id to be normalized and returned
 */
function normalizeId(id:string):string{
	if(!id) {
		console.error("[normalizeId] id is empty");
	}
    return id.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Normalizes a list of ids. Removes all non alphanumeric characters, and lowecases all characters
 * @param id - id to be normalized and returned
 */
function normalizeIdsList(ids:string):string{
	if(!ids) console.error("[normalizeIdsList] ids is empty");
    return ids.toLowerCase().replace(/[^a-z0-9,]/g, '')
}

/** returns an array of dictionaries/hashes
 * row is present only if at least one column is present (not `undefined`)
 * each row is a dictionary with columns (trimmed and lowecased) as name, and cell values as values
*/
async function getRawRows(sheet:gapi.client.sheets.Sheet):Promise<RowData[]> {
    if (!sheet) {
        Promise.reject("[getRawRows] We couldn't find the sheet with name '"+ GANTT_SHEET_NAME +"'");
        return;
    }
    // console.log('displayGantt sheet', sheet);
    // take a table's first header row and use it as object property names
    let rowsData:gapi.client.sheets.RowData[] = sheet.data[0].rowData;
    let result:RowData[] = [];

    // exctract headers
    let rowHeaders:gapi.client.sheets.RowData = rowsData[0];
    let rowHeadersCellsData:gapi.client.sheets.CellData[] = rowHeaders.values;
    let headersNames:string[] = [];
    for (let colNum = 0; rowHeaders && rowHeaders && colNum < rowHeadersCellsData.length; colNum++) {
        let headerName = rowHeaders.values[colNum].formattedValue;
        // transforming the header name
        headerName = normalizeId(headerName);
        headersNames[colNum] = headerName;
    }

    // exctract data rows
    for (let rowNum = FIRST_ROW_ID-1; rowNum < rowsData.length; rowNum++) {
        let newRow:RowData = {};
        newRow[RAW_ROW_ID] = ''+rowNum;
        let newRowHasData = false;
        let rowData:gapi.client.sheets.RowData = rowsData[rowNum];
        let rowCellsData:gapi.client.sheets.CellData[] = rowData.values;
        for (let colNum = 0; rowData && rowCellsData && colNum < rowCellsData.length; colNum++) {
            let headerName = headersNames[colNum];
            if (rowCellsData[colNum] &&
                (typeof rowCellsData[colNum].formattedValue !== 'undefined')) {
                // Leave empty values missing, everything else is a string.
                newRow[headerName] = '' + rowCellsData[colNum].formattedValue;
                newRowHasData = true;
            }
        }
        if (newRowHasData) { // if at least one cell is not `undefined`
            result.push(newRow);
        }
    }
    if(result.length <= 0){
        window.alert("[getRawRows] there is no any row in the `gantt` sheet");
    }
    return result;
}

/**
 * Get a string that represents row id info
 * @param rowNum the id of row in the array of rows that are analyzes (not sheet rows, that contains headers, etc)
 */
function getRowIdString(rowNum:number|string):string{
    return "[data-row:" +rowNum+ " (sheet-row:" +(parseInt(''+rowNum)+FIRST_ROW_ID-1)+ ")]";
}

// https://developers.google.com/chart/interactive/docs/quick_start
async function displayGantt(rows:RowData[]): Promise<void> {
    // the column names that the Google Gantt chart expects
    const COLUMN_GANTT_TASK_ID = 'Task ID';
    const COLUMN_GANTT_TASK_NAME = 'Task Name';
    const COLUMN_GANTT_RESOURCE = 'Resource';
    const COLUMN_GANTT_START_DATE = 'Start Date';
    const COLUMN_GANTT_END_DATE = 'End Date';
    const COLUMN_GANTT_DURATION = 'Duration';
    const COLUMN_GANTT_PERCENT_COMPLETE = 'Percent Complete';
    const COLUMN_GANTT_DEPENDENCIES = 'Dependencies';

    // console.log('displayGantt converted rows', rows);
    // create google DataTable
	// https://developers.google.com/chart/interactive/docs/reference#datatable-class
    let data:google.visualization.DataTable = new google.visualization.DataTable();

    // create the column names that the Google Gantt chart expects
    data.addColumn('string', COLUMN_GANTT_TASK_ID);
    data.addColumn('string', COLUMN_GANTT_TASK_NAME);
    data.addColumn('string', COLUMN_GANTT_RESOURCE);
    data.addColumn('date', COLUMN_GANTT_START_DATE);
    data.addColumn('date', COLUMN_GANTT_END_DATE);
    data.addColumn('number', COLUMN_GANTT_DURATION);
    data.addColumn('number', COLUMN_GANTT_PERCENT_COMPLETE);
    data.addColumn('string', COLUMN_GANTT_DEPENDENCIES);

    // an array of rows where
    // each row is an array of column values (no column names, or anything fancy)
    let allRows:any[][] = [];
    let taskIds: { [taskId: string] : boolean; } = {};
    console.info("Converting raw rows into gantt data ...");

    let isAnyRowWithTaskId:boolean = false;
    let isAnyRowNonCommented:boolean = false;
    for (let rowNum = 0; rowNum < rows.length; rowNum++) {
        let row:RowData = rows[rowNum];

        // if task id doesn't exist skip
        if(!row[COLUMN_TASK_ID]){
            console.log("[displayGantt]%s Missing the task id, skipping the row", getRowIdString(row[RAW_ROW_ID]));
            continue;
        }else{
            isAnyRowWithTaskId = true;
        }

        console.info("Currently parsing the row: ", row);
        // an array of column values (no column names, or anything fancy)
        let rowData:any = [];

        // Task ID
        // warn if task id is repeated
        let taskId:string = normalizeId(row[COLUMN_TASK_ID]);
        if (taskIds[taskId]) {
            alert("[displayGantt]"+getRowIdString(row[RAW_ROW_ID])+' Duplicate task id:' + taskId);
        }
        taskIds[taskId] = true;
        // add task id
        rowData.push(taskId);

        // Task Name
        // skipping the rows whose name is commented out (`#`)
        if (row[COLUMN_TASK_NAME] && row[COLUMN_TASK_NAME].startsWith('#')) {
            console.log("[displayGantt]%s Skipping row with task id: '%s' and task name: %s", getRowIdString(row[RAW_ROW_ID]), taskId, row[COLUMN_TASK_NAME]);
            continue;
        }else{
            isAnyRowNonCommented = true;
        }
        rowData.push(row[COLUMN_TASK_NAME]);

        // Resource
		if(!row[COLUMN_RESOURCE]){
			console.error("[displayGantt]%s Missing the resource, setting it to `null`", getRowIdString(row[RAW_ROW_ID]));
		}
        rowData.push(row[COLUMN_RESOURCE] ? row[COLUMN_RESOURCE].toLowerCase().trim() : null);

        // Start date
        // (slash hack for local timezone)
        // `YYYY-MM-DD` -> `YYYY/MM/DD`
        rowData.push(row[COLUMN_START_DATE] ? new Date(row[COLUMN_START_DATE].replace(/-/g, '/')) : null);

        // End date
        // (slash hack for local timezone)
        rowData.push(row[COLUMN_END_DATE] ? new Date(row[COLUMN_END_DATE].replace(/-/g, '/')) : null);
        // report end before start
        if (row[COLUMN_START_DATE] && row[COLUMN_END_DATE] && (new Date(row[COLUMN_START_DATE])) > (new Date(row[COLUMN_END_DATE]))) {
            alert("[displayGantt]"+getRowIdString(row[RAW_ROW_ID]) + ' Illogical, start date later than end date for id:' + taskId);
        }

        // Duration
        rowData.push(row[COLUMN_DURATION] ? strToMS(row[COLUMN_DURATION]) : null);

        // Percent
        rowData.push(row[COLUMN_PERCENT_COMPLETE] ? (+row[COLUMN_PERCENT_COMPLETE].replace(/\D\./g, '')) : 0);

        // Dependencies
        rowData.push(row[COLUMN_DEPENDENCIES] ? normalizeIdsList(row[COLUMN_DEPENDENCIES]) : null);

        console.log('[displayGantt]%s id,name,resource,start,end,dur,pct,dep', getRowIdString(row[RAW_ROW_ID]), rowData);
        // add new row to others
        allRows.push(rowData);
    };

    if(allRows.length <= 0){
        window.alert("[displayGantt] There is no a single row that conforms with gantt requirements")
    }

    console.info("Checking for missing dependencies that would break the chart ...");
    for (let rowNum = 0; rowNum < rows.length; rowNum++) {
        let row:RowData = rows[rowNum];

        // if task dependencies don't exist skip
        if(!row[COLUMN_DEPENDENCIES]) continue;
        
        row[COLUMN_DEPENDENCIES].split(',').forEach(dep => {
            dep = normalizeId(dep);
            if (dep && !taskIds[dep]) {
                alert("[displayGantt]"+getRowIdString(row[RAW_ROW_ID]) + '. Task:' + row[COLUMN_TASK_ID] + ' is missing dependency:' + dep);
            }
        });
    }

    // add all raw rows into google DataTable
    data.addRows(allRows);

    // set Gantt Chart Options
	let options = {
		gantt: {
			trackHeight: 30,
			defaultStartDateMillis: new Date(),
			criticalPathEnabled: false,
			criticalPathStyle: {
				stroke: '#e64a19',
				strokeWidth: 5
			},
			labelMaxWidth: 700,
			labelStyle: {
				fontName: "Ariel",
				fontSize: 27,
				color: '#757575'
			},
			barHeight: 20,
			shadowEnabled: true,
			sortTasks: false,
			// https://stackoverflow.com/questions/35165271/customize-the-bar-colors-in-google-gantt-charts
			palette: [
				{
					"color": "#7a7a7a",
					"dark": "#7a7a7a",
					"light": "#ff8888"
				},
				{
					"color": "#0a710c",
					"dark": "#0a710c",
					"light": "#88ff88"
				},
				{
					"color": "#000088",
					"dark": "#000088",
					"light": "#8888ff"
				},
				{
					"color": "#8888ff",
					"dark": "#8888ff",
					"light": "#ffff88"
				},
			]
		}
    };
    // drawing Google Gantt Chart
    console.log('Drawing chart');
    // google.visualization.Gantt not supported in @types
    // let chart:Gantt = google.visualization.Gantt(document.getElementById('chart_div'));
    let chart:GanttChart = new (<GanttVisualization><unknown>google.visualization).Gantt(document.getElementById('chart_div'));
    chart.draw(data, options);
}

export const startWork: Function = async() => {
	try {
		const documentId: string = await getSpreadshitId();
		const spreadshit: gapi.client.Response<gapi.client.sheets.Spreadsheet> = await getSpreadsheet(documentId);
		const sheet: gapi.client.sheets.Sheet = await getSheet(spreadshit);
		const rows: RowData[]  = await getRawRows(sheet);
		await displayGantt(rows);
	} catch(error) {
		console.error("General Error", error);
		alert('App error, see console.');
	}
}

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