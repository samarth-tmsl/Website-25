// Auth.gs
// User authentication and token verification module

/**
 * Verifies a Google access_token or id_token using Google's tokeninfo API
 * @param {string} token 
 * @returns {Object} User details containing email, name, role
 */
function authenticate(token) {
  if (!token) {
    throw new Error("Missing authentication token.");
  }
  
  var email = "";
  var name = "";
  
  try {
    // Try to verify as ID Token first, then fallback to Access Token
    var url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token);
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var json = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() !== 200 || !json.email) {
      // Fallback: check as Access Token
      url = "https://oauth2.googleapis.com/tokeninfo?access_token=" + encodeURIComponent(token);
      response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      json = JSON.parse(response.getContentText());
      
      if (response.getResponseCode() !== 200 || !json.email) {
        throw new Error("Invalid or expired authentication token.");
      }
    }
    
    email = json.email.toLowerCase().trim();
    name = json.name || email.split("@")[0];
  } catch(e) {
    throw new Error("Authentication failed: " + e.message);
  }
  
  // Verify user role and active status in Admins sheet
  var adminRecord = findAdminByEmail(email);
  if (!adminRecord) {
    // Bootstrapping: If there are no admins in the sheet, check if the authenticated user is the script owner.
    // If so, automatically add them as SUPER_ADMIN.
    var admins = readAllRows(SHEETS.ADMINS, false);
    var ownerEmail = Session.getEffectiveUser().getEmail().toLowerCase().trim();
    
    if (admins.length === 0 && email === ownerEmail) {
      var newAdmin = {
        id: generateId("ADM"),
        email: email,
        name: name,
        role: ROLES.SUPER_ADMIN,
        active: "TRUE",
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date())
      };
      appendRow(SHEETS.ADMINS, newAdmin);
      return {
        email: email,
        name: name,
        role: ROLES.SUPER_ADMIN
      };
    }
    
    throw new Error("Access denied. User is not registered as an administrator.");
  }
  
  // Check if admin is active
  var isActive = adminRecord.active === true || adminRecord.active === "TRUE" || adminRecord.active === 1;
  if (!isActive) {
    throw new Error("Access denied. This administrator account has been deactivated.");
  }
  
  return {
    email: adminRecord.email,
    name: adminRecord.name || name,
    role: adminRecord.role
  };
}

/**
 * Finds an admin record by email (case-insensitive)
 */
function findAdminByEmail(email) {
  var admins = readAllRows(SHEETS.ADMINS, false);
  var targetEmail = email.toLowerCase().trim();
  for (var i = 0; i < admins.length; i++) {
    if (admins[i].email.toLowerCase().trim() === targetEmail) {
      return admins[i];
    }
  }
  return null;
}
