// AuditLogs.gs
// Audit logging module to capture administrative changes

/**
 * Creates a log entry in the AuditLogs sheet
 * @param {string} adminEmail Email of the administrator performing the action
 * @param {string} action Action type (e.g. CREATE, UPDATE, DELETE)
 * @param {string} entity Entity type (e.g. Team, Guests, Events)
 * @param {string} entityId ID of the entity affected
 * @param {string|Object} details Additional text details of the operation
 */
function logAction(adminEmail, action, entity, entityId, details) {
  try {
    var detailsStr = details;
    if (typeof details === "object") {
      detailsStr = JSON.stringify(details);
    }
    
    var logEntry = {
      id: generateId("LOG"),
      timestamp: formatDate(new Date()),
      adminEmail: adminEmail || "system",
      action: action,
      entity: entity,
      entityId: entityId || "",
      details: detailsStr || ""
    };
    
    appendRow(SHEETS.AUDIT_LOGS, logEntry);
  } catch(e) {
    // Fail silently to avoid breaking the core transaction if audit logging fails
    console.error("Failed to write audit log: " + e.message);
  }
}

/**
 * Fetches all audit logs (SUPER_ADMIN only)
 */
function getAuditLogsController(user) {
  enforcePermission(user, "audit_logs", "READ");
  var logs = readAllRows(SHEETS.AUDIT_LOGS, false);
  
  // Sort logs by timestamp descending
  logs.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  return logs;
}
