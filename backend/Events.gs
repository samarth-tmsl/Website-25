// Events.gs
// Controller for managing Club Events

/**
 * Returns active public events list
 */
function getEventsPublic(params) {
  var events = readAllRows(SHEETS.EVENTS, true);
  
  var result = [];
  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    
    // Filter draft state for public site
    if (ev.status === "DRAFT") continue;
    
    if (params.academicYear && ev.academicYear !== params.academicYear) continue;
    if (params.slug && ev.slug !== params.slug) continue;
    
    result.push({
      id: ev.id,
      academicYear: ev.academicYear,
      title: ev.title,
      slug: ev.slug,
      description: ev.description,
      date: ev.date ? formatDate(ev.date) : "",
      startTime: ev.startTime,
      endTime: ev.endTime,
      venue: ev.venue,
      poster: generateImageUrl(ev.posterFileId),
      registrationUrl: ev.registrationUrl,
      status: ev.status,
      displayOrder: Number(ev.displayOrder || 999)
    });
  }
  
  result.sort(function(a, b) {
    return a.displayOrder - b.displayOrder;
  });
  
  return result;
}

/**
 * Admin view of all events
 */
function getEventsAdmin(user) {
  enforcePermission(user, "events", "READ");
  var events = readAllRows(SHEETS.EVENTS, false);
  
  for (var i = 0; i < events.length; i++) {
    events[i].posterUrl = generateImageUrl(events[i].posterFileId);
  }
  
  events.sort(function(a, b) {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return Number(a.displayOrder || 999) - Number(b.displayOrder || 999);
  });
  
  return events;
}

/**
 * Create a new event
 */
function createEventController(user, payload) {
  enforcePermission(user, "events", "CREATE");
  
  if (!payload.title || !payload.slug || !payload.academicYear) {
    throw new Error("Missing required fields: title, slug, or academicYear.");
  }
  
  if (!validateSlug(payload.slug)) {
    throw new Error("Invalid URL slug format. Only lowercase letters, numbers, and dashes are allowed.");
  }
  
  // Check slug uniqueness
  var existingEvents = readAllRows(SHEETS.EVENTS, false);
  for (var i = 0; i < existingEvents.length; i++) {
    if (existingEvents[i].slug === payload.slug) {
      throw new Error("An event with this URL slug already exists.");
    }
  }
  
  var posterFileId = "";
  if (payload.poster) {
    validateImageUpload(payload.poster.base64, payload.poster.fileName, payload.poster.mimeType);
    posterFileId = uploadFile(payload.poster.base64, payload.poster.fileName, payload.poster.mimeType, FOLDER_IDS.Events || ROOT_FOLDER_ID);
  }
  
  var newEvent = {
    id: generateId("EVENT"),
    academicYear: payload.academicYear,
    title: payload.title,
    slug: payload.slug.toLowerCase().trim(),
    description: payload.description || "",
    date: payload.date || "",
    startTime: payload.startTime || "",
    endTime: payload.endTime || "",
    venue: payload.venue || "",
    posterFileId: posterFileId,
    registrationUrl: payload.registrationUrl || "",
    status: payload.status || "UPCOMING",
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : 999,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : "TRUE",
    createdAt: formatDate(new Date()),
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  appendRow(SHEETS.EVENTS, newEvent);
  logAction(user.email, "CREATE_EVENT", "Events", newEvent.id, "Created event " + newEvent.title);
  
  return newEvent;
}

/**
 * Update an existing event
 */
function updateEventController(user, id, payload) {
  enforcePermission(user, "events", "UPDATE");
  
  var record = findRowById(SHEETS.EVENTS, id);
  if (!record) {
    throw new Error("Event not found.");
  }
  
  if (payload.slug && payload.slug !== record.slug) {
    if (!validateSlug(payload.slug)) {
      throw new Error("Invalid URL slug format.");
    }
    
    // Check slug uniqueness
    var existingEvents = readAllRows(SHEETS.EVENTS, false);
    for (var i = 0; i < existingEvents.length; i++) {
      if (existingEvents[i].slug === payload.slug && existingEvents[i].id !== id) {
        throw new Error("An event with this URL slug already exists.");
      }
    }
  }
  
  var posterFileId = record.posterFileId;
  var oldPosterFileId = "";
  
  if (payload.poster) {
    validateImageUpload(payload.poster.base64, payload.poster.fileName, payload.poster.mimeType);
    oldPosterFileId = record.posterFileId;
    posterFileId = uploadFile(payload.poster.base64, payload.poster.fileName, payload.poster.mimeType, FOLDER_IDS.Events || ROOT_FOLDER_ID);
  }
  
  var updatedData = {
    academicYear: payload.academicYear !== undefined ? payload.academicYear : record.academicYear,
    title: payload.title !== undefined ? payload.title : record.title,
    slug: payload.slug !== undefined ? payload.slug.toLowerCase().trim() : record.slug,
    description: payload.description !== undefined ? payload.description : record.description,
    date: payload.date !== undefined ? payload.date : record.date,
    startTime: payload.startTime !== undefined ? payload.startTime : record.startTime,
    endTime: payload.endTime !== undefined ? payload.endTime : record.endTime,
    venue: payload.venue !== undefined ? payload.venue : record.venue,
    posterFileId: posterFileId,
    registrationUrl: payload.registrationUrl !== undefined ? payload.registrationUrl : record.registrationUrl,
    status: payload.status !== undefined ? payload.status : record.status,
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : record.displayOrder,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : record.active,
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  updateRow(SHEETS.EVENTS, record._rowNum, updatedData);
  logAction(user.email, "UPDATE_EVENT", "Events", id, "Updated event " + updatedData.title);
  
  if (oldPosterFileId && payload.deleteOldImage === true) {
    deleteFile(oldPosterFileId);
  }
  
  return updatedData;
}

/**
 * Delete or deactivate an event
 */
function deleteEventController(user, id, hardDelete) {
  enforcePermission(user, "events", "DELETE");
  
  var record = findRowById(SHEETS.EVENTS, id);
  if (!record) {
    throw new Error("Event not found.");
  }
  
  if (hardDelete === true || hardDelete === "true") {
    if (record.posterFileId) {
      deleteFile(record.posterFileId);
    }
    deleteRow(SHEETS.EVENTS, record._rowNum);
    logAction(user.email, "DELETE_EVENT", "Events", id, "Permanently deleted event " + record.title);
  } else {
    updateRow(SHEETS.EVENTS, record._rowNum, {
      active: "FALSE",
      updatedAt: formatDate(new Date()),
      updatedBy: user.email
    });
    logAction(user.email, "DEACTIVATE_EVENT", "Events", id, "Deactivated event " + record.title);
  }
  
  return true;
}
