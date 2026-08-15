// Settings.gs
// Controller for managing application system settings

/**
 * Returns public-safe configuration settings
 */
function getSettingsPublic() {
  var list = readAllRows(SHEETS.SETTINGS, false);
  var obj = {};
  
  // Define key-value pairs that are safe to expose
  var publicKeys = [
    "site_name",
    "current_academic_year",
    "maintenance_mode",
    "gallery_enabled",
    "announcements_enabled",
    "sponsors_enabled"
  ];
  
  // Set defaults
  obj["site_name"] = "Samarth";
  obj["maintenance_mode"] = "FALSE";
  obj["gallery_enabled"] = "TRUE";
  obj["announcements_enabled"] = "TRUE";
  obj["sponsors_enabled"] = "TRUE";
  
  for (var i = 0; i < list.length; i++) {
    var key = list[i].key;
    if (publicKeys.indexOf(key) !== -1) {
      obj[key] = list[i].value;
    }
  }
  
  // Double-check the current academic year settings if not set
  if (!obj["current_academic_year"]) {
    var currentYearObj = getActiveAcademicYear();
    if (currentYearObj) {
      obj["current_academic_year"] = currentYearObj.year;
    }
  }
  
  return obj;
}

/**
 * Returns all settings for admins
 */
function getSettingsAdminController(user) {
  enforcePermission(user, "settings", "READ");
  var list = readAllRows(SHEETS.SETTINGS, false);
  return list;
}

/**
 * Updates settings keys in bulk
 */
function updateSettingsController(user, payload) {
  enforcePermission(user, "settings", "UPDATE");
  
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload structure. Expected key-value object.");
  }
  
  var list = readAllRows(SHEETS.SETTINGS, false);
  var lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(10000);
    var sheet = getSheet(SHEETS.SETTINGS);
    var keysToUpdate = Object.keys(payload);
    
    for (var k = 0; k < keysToUpdate.length; k++) {
      var key = keysToUpdate[k];
      var val = String(payload[key]);
      
      var found = false;
      for (var i = 0; i < list.length; i++) {
        if (list[i].key === key) {
          // Update existing row
          updateRow(SHEETS.SETTINGS, list[i]._rowNum, {
            value: val,
            updatedAt: formatDate(new Date()),
            updatedBy: user.email
          });
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Append new setting key
        appendRow(SHEETS.SETTINGS, {
          key: key,
          value: val,
          description: "Custom setting key",
          updatedAt: formatDate(new Date()),
          updatedBy: user.email
        });
      }
    }
    
    logAction(user.email, "UPDATE_SETTINGS", "Settings", "", "Bulk updated settings: " + keysToUpdate.join(", "));
    SpreadsheetApp.flush();
    return true;
  } finally {
    lock.releaseLock();
  }
}
