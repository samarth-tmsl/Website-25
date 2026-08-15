// Admins.gs
// Controller for managing Administrators (SUPER_ADMIN only)

/**
 * Returns all admins list
 */
function getAdminsAdminController(user) {
  enforcePermission(user, "admins", "READ");
  var list = readAllRows(SHEETS.ADMINS, false);
  return list;
}

/**
 * Adds a new admin
 */
function createAdminController(user, payload) {
  enforcePermission(user, "admins", "CREATE");
  
  if (!payload.email || !payload.role) {
    throw new Error("Missing required fields: email or role.");
  }
  
  if (!validateEmail(payload.email)) {
    throw new Error("Invalid email address format.");
  }
  
  var targetEmail = payload.email.toLowerCase().trim();
  
  // Verify uniqueness
  var existing = findAdminByEmail(targetEmail);
  if (existing) {
    throw new Error("An admin record with email " + targetEmail + " already exists.");
  }
  
  var newAdmin = {
    id: generateId("ADM"),
    email: targetEmail,
    name: payload.name || targetEmail.split("@")[0],
    role: payload.role.toUpperCase(),
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : "TRUE",
    createdAt: formatDate(new Date()),
    updatedAt: formatDate(new Date())
  };
  
  appendRow(SHEETS.ADMINS, newAdmin);
  logAction(user.email, "CREATE_ADMIN", "Admins", newAdmin.id, "Registered new admin: " + newAdmin.email + " (" + newAdmin.role + ")");
  
  return newAdmin;
}

/**
 * Updates an admin record
 */
function updateAdminController(user, id, payload) {
  enforcePermission(user, "admins", "UPDATE");
  
  var record = findRowById(SHEETS.ADMINS, id);
  if (!record) {
    throw new Error("Admin record not found.");
  }
  
  // Prevent changing email to something already exists
  if (payload.email && payload.email.toLowerCase().trim() !== record.email.toLowerCase().trim()) {
    if (!validateEmail(payload.email)) {
      throw new Error("Invalid email format.");
    }
    var existing = findAdminByEmail(payload.email);
    if (existing && existing.id !== id) {
      throw new Error("An admin record with that email already exists.");
    }
  }
  
  // Prevent a SUPER_ADMIN from deactivating or demoting themselves
  if (record.email.toLowerCase().trim() === user.email.toLowerCase().trim()) {
    if (payload.active === false || payload.active === "FALSE" || (payload.role && payload.role !== ROLES.SUPER_ADMIN)) {
      throw new Error("Security violation. You cannot deactivate or demote your own account.");
    }
  }
  
  var updatedData = {
    email: payload.email !== undefined ? payload.email.toLowerCase().trim() : record.email,
    name: payload.name !== undefined ? payload.name.trim() : record.name,
    role: payload.role !== undefined ? payload.role.toUpperCase() : record.role,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : record.active,
    updatedAt: formatDate(new Date())
  };
  
  updateRow(SHEETS.ADMINS, record._rowNum, updatedData);
  logAction(user.email, "UPDATE_ADMIN", "Admins", id, "Updated admin details for " + updatedData.email);
  
  return updatedData;
}

/**
 * Deletes an admin record
 */
function deleteAdminController(user, id) {
  enforcePermission(user, "admins", "DELETE");
  
  var record = findRowById(SHEETS.ADMINS, id);
  if (!record) {
    throw new Error("Admin record not found.");
  }
  
  // Prevent deleting oneself
  if (record.email.toLowerCase().trim() === user.email.toLowerCase().trim()) {
    throw new Error("Security violation. You cannot delete your own account.");
  }
  
  deleteRow(SHEETS.ADMINS, record._rowNum);
  logAction(user.email, "DELETE_ADMIN", "Admins", id, "Removed admin access for " + record.email);
  
  return true;
}
