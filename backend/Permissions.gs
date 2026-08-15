// Permissions.gs
// Role-based Access Control (RBAC) permission validator

/**
 * Validates if a user has permission to perform a specific action on a resource
 * @param {Object} user User object containing role
 * @param {string} resource Name of resource (admins, settings, team, guests, gallery, events, sponsors, announcements, audit_logs)
 * @param {string} action Action being performed (CREATE, READ, UPDATE, DELETE)
 * @returns {boolean}
 */
function checkPermission(user, resource, action) {
  if (!user || !user.role) return false;
  
  var role = user.role.toUpperCase();
  action = action.toUpperCase();
  resource = resource.toLowerCase();
  
  // SUPER_ADMIN has full permissions on everything
  if (role === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // ADMIN role permissions
  if (role === ROLES.ADMIN) {
    // ADMIN cannot manage other admins or view/clear audit logs
    if (resource === "admins" || resource === "audit_logs") {
      return false;
    }
    // ADMIN cannot change critical settings (only read settings is allowed)
    if (resource === "settings" && action !== "READ") {
      return false;
    }
    // ADMIN can do everything else (Team, Guests, Gallery, Events, Sponsors, Announcements)
    return true;
  }
  
  // EDITOR role permissions
  if (role === ROLES.EDITOR) {
    // EDITOR cannot manage admins, change settings, view audit logs, or manage sponsors/events/announcements
    if (resource === "admins" || resource === "settings" || resource === "audit_logs" || 
        resource === "sponsors" || resource === "events" || resource === "announcements") {
      return false;
    }
    // EDITOR cannot delete any resources
    if (action === "DELETE") {
      return false;
    }
    // EDITOR can manage Team, Guests, and Gallery (read, create, update)
    if (resource === "team" || resource === "guests" || resource === "gallery") {
      return true;
    }
  }
  
  return false;
}

/**
 * Throws an error if the user lacks the required permission
 */
function enforcePermission(user, resource, action) {
  if (!checkPermission(user, resource, action)) {
    throw new Error("Forbidden. You do not have permission to " + action + " " + resource + ".");
  }
}
