// Sheets.gs
// Database interaction layer for Google Sheets

/**
 * Accesses a spreadsheet by configured SPREADSHEET_ID or default active sheet
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Accesses a sheet by name
 */
function getSheet(name) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error("Sheet '" + name + "' not found.");
  }
  return sheet;
}

/**
 * Maps rows of a sheet into an array of JavaScript objects based on header row
 */
function readAllRows(sheetName, filterActiveOnly) {
  var sheet = getSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var data = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      if (key) {
        obj[key] = row[j];
      }
    }
    obj._rowNum = i + 2; // Store physical row number (1-indexed, starting after header)
    
    if (filterActiveOnly) {
      if (obj.hasOwnProperty("active") && (obj.active === false || obj.active === "FALSE" || obj.active === 0)) {
        continue;
      }
    }
    data.push(obj);
  }
  return data;
}

/**
 * Finds a row object by ID
 */
function findRowById(sheetName, id) {
  var rows = readAllRows(sheetName, false);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === id) {
      return rows[i];
    }
  }
  return null;
}

/**
 * Appends a JavaScript object to a sheet matching the headers
 */
function appendRow(sheetName, obj) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // 10 seconds timeout
    
    var sheet = getSheet(sheetName);
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    var newRow = [];
    for (var i = 0; i < headers.length; i++) {
      var key = headers[i];
      var val = obj[key] !== undefined ? obj[key] : "";
      newRow.push(val);
    }
    
    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    return true;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Updates an existing row in a sheet matching headers
 */
function updateRow(sheetName, rowNum, obj) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    
    var sheet = getSheet(sheetName);
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    var updateRange = sheet.getRange(rowNum, 1, 1, lastCol);
    var values = updateRange.getValues()[0];
    
    for (var i = 0; i < headers.length; i++) {
      var key = headers[i];
      if (obj.hasOwnProperty(key)) {
        values[i] = obj[key];
      }
    }
    
    updateRange.setValues([values]);
    SpreadsheetApp.flush();
    return true;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Deletes a row physically from the sheet by its row number
 */
function deleteRow(sheetName, rowNum) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var sheet = getSheet(sheetName);
    sheet.deleteRow(rowNum);
    SpreadsheetApp.flush();
    return true;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to generate a unique database ID with a prefix
 */
function generateId(prefix) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var randomPart = "";
  for (var i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + "_" + randomPart;
}
