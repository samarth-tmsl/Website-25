// Announcements.gs
// Controller for managing announcements and banners

/**
 * Returns active announcements (startDate <= today <= endDate)
 */
function getAnnouncementsPublic() {
  var list = readAllRows(SHEETS.ANNOUNCEMENTS, true);
  var todayStr = formatDate(new Date()).substring(0, 10); // YYYY-MM-DD
  
  var result = [];
  for (var i = 0; i < list.length; i++) {
    var a = list[i];
    
    // Date checks
    var start = a.startDate ? String(a.startDate).substring(0, 10) : "";
    var end = a.endDate ? String(a.endDate).substring(0, 10) : "";
    
    if (start && todayStr < start) continue;
    if (end && todayStr > end) continue;
    
    result.push({
      id: a.id,
      title: a.title,
      content: a.content,
      link: a.link,
      priority: Number(a.priority || 0)
    });
  }
  
  // Sort by priority desc, then createdAt desc
  result.sort(function(a, b) {
    return b.priority - a.priority;
  });
  
  return result;
}

/**
 * Admin view of all announcements
 */
function getAnnouncementsAdmin(user) {
  enforcePermission(user, "announcements", "READ");
  var list = readAllRows(SHEETS.ANNOUNCEMENTS, false);
  
  list.sort(function(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  return list;
}

/**
 * Creates a new announcement
 */
function createAnnouncementController(user, payload) {
  enforcePermission(user, "announcements", "CREATE");
  
  if (!payload.title || !payload.content) {
    throw new Error("Missing required fields: title or content.");
  }
  
  var newAnnouncement = {
    id: generateId("ANN"),
    title: payload.title,
    content: payload.content,
    link: payload.link || "",
    priority: payload.priority !== undefined ? Number(payload.priority) : 0,
    startDate: payload.startDate || "",
    endDate: payload.endDate || "",
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : "TRUE",
    createdAt: formatDate(new Date()),
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  appendRow(SHEETS.ANNOUNCEMENTS, newAnnouncement);
  logAction(user.email, "CREATE_ANNOUNCEMENT", "Announcements", newAnnouncement.id, "Created announcement: " + newAnnouncement.title);
  
  return newAnnouncement;
}

/**
 * Updates an announcement
 */
function updateAnnouncementController(user, id, payload) {
  enforcePermission(user, "announcements", "UPDATE");
  
  var record = findRowById(SHEETS.ANNOUNCEMENTS, id);
  if (!record) {
    throw new Error("Announcement not found.");
  }
  
  var updatedData = {
    title: payload.title !== undefined ? payload.title : record.title,
    content: payload.content !== undefined ? payload.content : record.content,
    link: payload.link !== undefined ? payload.link : record.link,
    priority: payload.priority !== undefined ? Number(payload.priority) : record.priority,
    startDate: payload.startDate !== undefined ? payload.startDate : record.startDate,
    endDate: payload.endDate !== undefined ? payload.endDate : record.endDate,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : record.active,
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  updateRow(SHEETS.ANNOUNCEMENTS, record._rowNum, updatedData);
  logAction(user.email, "UPDATE_ANNOUNCEMENT", "Announcements", id, "Updated announcement: " + updatedData.title);
  
  return updatedData;
}

/**
 * Deletes an announcement
 */
function deleteAnnouncementController(user, id) {
  enforcePermission(user, "announcements", "DELETE");
  
  var record = findRowById(SHEETS.ANNOUNCEMENTS, id);
  if (!record) {
    throw new Error("Announcement not found.");
  }
  
  deleteRow(SHEETS.ANNOUNCEMENTS, record._rowNum);
  logAction(user.email, "DELETE_ANNOUNCEMENT", "Announcements", id, "Deleted announcement: " + record.title);
  
  return true;
}
