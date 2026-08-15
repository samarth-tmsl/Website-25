// Code.gs
// Entry point for Google Apps Script Web App execution

/**
 * Handle HTTP GET request
 */
function doGet(e) {
  return routeGet(e);
}

/**
 * Handle HTTP POST request
 */
function doPost(e) {
  // CORS preflight requests bypass doPost, but standard browser forms/JSON requests hit this.
  return routePost(e);
}

/**
 * One-click installer and setup bootstrapper.
 * Run this function inside the Apps Script Editor to automatically initialize
 * the Spreadsheet tabs, headers, Google Drive folders, and default settings.
 */
function runSetup() {
  Logger.log("Starting Samarth CMS Auto-Setup...");
  
  // 1. Setup Google Spreadsheet
  var ss;
  if (SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      Logger.log("Opened existing Spreadsheet with ID: " + SPREADSHEET_ID);
    } catch(err) {
      Logger.log("Failed to open spreadsheet ID. Creating a new one...");
    }
  }
  
  if (!ss) {
    ss = SpreadsheetApp.create("Samarth Website CMS");
    SPREADSHEET_ID = ss.getId();
    Logger.log("Created a new Spreadsheet named 'Samarth Website CMS' with ID: " + SPREADSHEET_ID);
  }
  
  // Create all required tabs with header columns
  var tabsSetup = [
    { name: SHEETS.SETTINGS, headers: ["key", "value", "description", "updatedAt", "updatedBy"] },
    { name: SHEETS.ADMINS, headers: ["id", "email", "name", "role", "active", "createdAt", "updatedAt"] },
    { name: SHEETS.ACADEMIC_YEARS, headers: ["id", "year", "label", "active", "isCurrent", "createdAt", "updatedAt"] },
    { name: SHEETS.TEAM, headers: ["id", "academicYear", "wing", "name", "position", "bio", "imageFileId", "linkedin", "github", "instagram", "email", "displayOrder", "active", "createdAt", "updatedAt", "updatedBy"] },
    { name: SHEETS.GUESTS, headers: ["id", "academicYear", "eventId", "name", "designation", "organization", "description", "imageFileId", "displayOrder", "active", "createdAt", "updatedAt", "updatedBy"] },
    { name: SHEETS.GALLERY_ALBUMS, headers: ["id", "academicYear", "title", "description", "eventId", "coverImageId", "displayOrder", "active", "createdAt", "updatedAt", "updatedBy"] },
    { name: SHEETS.GALLERY_IMAGES, headers: ["id", "albumId", "fileId", "fileName", "caption", "displayOrder", "active", "uploadedAt", "uploadedBy"] },
    { name: SHEETS.EVENTS, headers: ["id", "academicYear", "title", "slug", "description", "date", "startTime", "endTime", "venue", "posterFileId", "registrationUrl", "status", "displayOrder", "active", "createdAt", "updatedAt", "updatedBy"] },
    { name: SHEETS.ANNOUNCEMENTS, headers: ["id", "title", "content", "link", "priority", "startDate", "endDate", "active", "createdAt", "updatedAt", "updatedBy"] },
    { name: SHEETS.SPONSORS, headers: ["id", "academicYear", "name", "logoFileId", "website", "description", "tier", "displayOrder", "active", "createdAt", "updatedAt", "updatedBy"] },
    { name: SHEETS.AUDIT_LOGS, headers: ["id", "timestamp", "adminEmail", "action", "entity", "entityId", "details"] }
  ];
  
  for (var i = 0; i < tabsSetup.length; i++) {
    var tabInfo = tabsSetup[i];
    var sheet = ss.getSheetByName(tabInfo.name);
    if (!sheet) {
      sheet = ss.insertSheet(tabInfo.name);
      Logger.log("Inserted sheet tab: " + tabInfo.name);
    }
    // Set headers
    sheet.getRange(1, 1, 1, tabInfo.headers.length).setValues([tabInfo.headers]);
    sheet.getRange(1, 1, 1, tabInfo.headers.length).setFontWeight("bold");
    
    // Remove empty columns and rows to keep it neat
    if (sheet.getMaxColumns() > tabInfo.headers.length) {
      sheet.deleteColumns(tabInfo.headers.length + 1, sheet.getMaxColumns() - tabInfo.headers.length);
    }
  }
  
  // Remove the default Sheet1 if exists
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
  }
  
  // 2. Setup Google Drive Folder Structure
  var rootFolder;
  if (ROOT_FOLDER_ID) {
    try {
      rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
      Logger.log("Opened existing Drive Root Folder: " + rootFolder.getName());
    } catch(err) {
      Logger.log("Could not access Drive Root Folder ID. Creating new...");
    }
  }
  
  if (!rootFolder) {
    rootFolder = DriveApp.createFolder("Samarth Website");
    ROOT_FOLDER_ID = rootFolder.getId();
    Logger.log("Created Root Drive folder 'Samarth Website' with ID: " + ROOT_FOLDER_ID);
  }
  
  // Create subfolders
  var subfolders = ["Team", "Guests", "Gallery", "Events", "Sponsors", "Misc"];
  for (var i = 0; i < subfolders.length; i++) {
    var subName = subfolders[i];
    var subfolderIter = rootFolder.getFoldersByName(subName);
    var targetSub;
    if (subfolderIter.hasNext()) {
      targetSub = subfolderIter.next();
      Logger.log("Subfolder already exists: " + subName);
    } else {
      targetSub = rootFolder.createFolder(subName);
      Logger.log("Created subfolder: " + subName);
    }
    FOLDER_IDS[subName] = targetSub.getId();
    targetSub.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
  
  // Set permissions on root folder
  rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // 3. Seed Default Settings
  var settingsSheet = ss.getSheetByName(SHEETS.SETTINGS);
  var currentSettings = readAllRows(SHEETS.SETTINGS, false);
  var defaultSettings = [
    { key: "site_name", value: "Samarth", description: "The public name of the club/organization website" },
    { key: "maintenance_mode", value: "FALSE", description: "Set to TRUE to show maintenance screens" },
    { key: "gallery_enabled", value: "TRUE", description: "Toggle image gallery access" },
    { key: "announcements_enabled", value: "TRUE", description: "Toggle promotional banner notifications" },
    { key: "sponsors_enabled", value: "TRUE", description: "Toggle sponsor section visibility" }
  ];
  
  for (var i = 0; i < defaultSettings.length; i++) {
    var def = defaultSettings[i];
    var exists = false;
    for (var j = 0; j < currentSettings.length; j++) {
      if (currentSettings[j].key === def.key) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      appendRow(SHEETS.SETTINGS, {
        key: def.key,
        value: def.value,
        description: def.description,
        updatedAt: formatDate(new Date()),
        updatedBy: "Auto-Setup"
      });
    }
  }
  
  // 4. Seed Current Academic Year
  var aySheet = ss.getSheetByName(SHEETS.ACADEMIC_YEARS);
  var currentAYs = readAllRows(SHEETS.ACADEMIC_YEARS, false);
  if (currentAYs.length === 0) {
    appendRow(SHEETS.ACADEMIC_YEARS, {
      id: generateId("AY"),
      year: "2026-27",
      label: "2026-27 (Current)",
      active: "TRUE",
      isCurrent: "TRUE",
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    });
    Logger.log("Seed complete: Added default academic year 2026-27");
  }
  
  // 5. Seed Creator as SUPER_ADMIN
  var adminsSheet = ss.getSheetByName(SHEETS.ADMINS);
  var currentAdmins = readAllRows(SHEETS.ADMINS, false);
  if (currentAdmins.length === 0) {
    var ownerEmail = Session.getEffectiveUser().getEmail().toLowerCase().trim();
    appendRow(SHEETS.ADMINS, {
      id: generateId("ADM"),
      email: ownerEmail,
      name: "Owner Account",
      role: ROLES.SUPER_ADMIN,
      active: "TRUE",
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    });
    Logger.log("Seed complete: Added script owner (" + ownerEmail + ") as SUPER_ADMIN");
  }
  
  Logger.log("=================================================");
  Logger.log("SAMARTH CMS SETUP COMPLETED SUCCESSFULLY!");
  Logger.log("=================================================");
  Logger.log("COPY & PASTE THESE CONSTANTS TO YOUR backend/Config.gs FILE:");
  Logger.log("var SPREADSHEET_ID = \"" + SPREADSHEET_ID + "\";");
  Logger.log("var ROOT_FOLDER_ID = \"" + ROOT_FOLDER_ID + "\";");
  Logger.log("var FOLDER_IDS = " + JSON.stringify(FOLDER_IDS, null, 2) + ";");
  Logger.log("=================================================");
  
  // Add a nice UI popup if run inside sheet directly
  try {
    SpreadsheetApp.getUi().alert("CMS Auto-Setup complete! Check Logs (Ctrl+Enter) in Apps Script Editor for Config values.");
  } catch(e) {}
}
