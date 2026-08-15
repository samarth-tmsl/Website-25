// Guests.gs
// Controller for managing Guest speakers and invitees

/**
 * Returns active guests list
 */
function getGuestsPublic(params) {
  var guests = readAllRows(SHEETS.GUESTS, true);
  
  var result = [];
  for (var i = 0; i < guests.length; i++) {
    var g = guests[i];
    
    // Filters
    if (params.academicYear && g.academicYear !== params.academicYear) continue;
    if (params.eventId && g.eventId !== params.eventId) continue;
    
    result.push({
      id: g.id,
      academicYear: g.academicYear,
      eventId: g.eventId,
      name: g.name,
      designation: g.designation,
      organization: g.organization,
      description: g.description,
      image: generateImageUrl(g.imageFileId),
      displayOrder: Number(g.displayOrder || 999)
    });
  }
  
  result.sort(function(a, b) {
    return a.displayOrder - b.displayOrder;
  });
  
  return result;
}

/**
 * Returns all guests for admins
 */
function getGuestsAdmin(user) {
  enforcePermission(user, "guests", "READ");
  var guests = readAllRows(SHEETS.GUESTS, false);
  
  for (var i = 0; i < guests.length; i++) {
    guests[i].imageUrl = generateImageUrl(guests[i].imageFileId);
  }
  
  guests.sort(function(a, b) {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return Number(a.displayOrder || 999) - Number(b.displayOrder || 999);
  });
  
  return guests;
}

/**
 * Creates a new guest speaker
 */
function createGuestController(user, payload) {
  enforcePermission(user, "guests", "CREATE");
  
  if (!payload.name || !payload.academicYear) {
    throw new Error("Missing required fields: name or academicYear.");
  }
  
  var imageFileId = "";
  if (payload.image) {
    validateImageUpload(payload.image.base64, payload.image.fileName, payload.image.mimeType);
    imageFileId = uploadFile(payload.image.base64, payload.image.fileName, payload.image.mimeType, FOLDER_IDS.Guests || ROOT_FOLDER_ID);
  }
  
  var newGuest = {
    id: generateId("GUEST"),
    academicYear: payload.academicYear,
    eventId: payload.eventId || "",
    name: payload.name,
    designation: payload.designation || "",
    organization: payload.organization || "",
    description: payload.description || "",
    imageFileId: imageFileId,
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : 999,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : "TRUE",
    createdAt: formatDate(new Date()),
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  appendRow(SHEETS.GUESTS, newGuest);
  logAction(user.email, "CREATE_GUEST", "Guests", newGuest.id, "Created guest speaker " + newGuest.name);
  
  return newGuest;
}

/**
 * Updates an existing guest speaker
 */
function updateGuestController(user, id, payload) {
  enforcePermission(user, "guests", "UPDATE");
  
  var record = findRowById(SHEETS.GUESTS, id);
  if (!record) {
    throw new Error("Guest speaker not found.");
  }
  
  var imageFileId = record.imageFileId;
  var oldImageFileId = "";
  
  if (payload.image) {
    validateImageUpload(payload.image.base64, payload.image.fileName, payload.image.mimeType);
    oldImageFileId = record.imageFileId;
    imageFileId = uploadFile(payload.image.base64, payload.image.fileName, payload.image.mimeType, FOLDER_IDS.Guests || ROOT_FOLDER_ID);
  }
  
  var updatedData = {
    academicYear: payload.academicYear !== undefined ? payload.academicYear : record.academicYear,
    eventId: payload.eventId !== undefined ? payload.eventId : record.eventId,
    name: payload.name !== undefined ? payload.name : record.name,
    designation: payload.designation !== undefined ? payload.designation : record.designation,
    organization: payload.organization !== undefined ? payload.organization : record.organization,
    description: payload.description !== undefined ? payload.description : record.description,
    imageFileId: imageFileId,
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : record.displayOrder,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : record.active,
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  updateRow(SHEETS.GUESTS, record._rowNum, updatedData);
  logAction(user.email, "UPDATE_GUEST", "Guests", id, "Updated guest speaker " + updatedData.name);
  
  if (oldImageFileId && payload.deleteOldImage === true) {
    deleteFile(oldImageFileId);
  }
  
  return updatedData;
}

/**
 * Deletes or deactivates a guest speaker
 */
function deleteGuestController(user, id, hardDelete) {
  enforcePermission(user, "guests", "DELETE");
  
  var record = findRowById(SHEETS.GUESTS, id);
  if (!record) {
    throw new Error("Guest speaker not found.");
  }
  
  if (hardDelete === true || hardDelete === "true") {
    if (record.imageFileId) {
      deleteFile(record.imageFileId);
    }
    deleteRow(SHEETS.GUESTS, record._rowNum);
    logAction(user.email, "DELETE_GUEST", "Guests", id, "Permanently deleted guest " + record.name);
  } else {
    updateRow(SHEETS.GUESTS, record._rowNum, {
      active: "FALSE",
      updatedAt: formatDate(new Date()),
      updatedBy: user.email
    });
    logAction(user.email, "DEACTIVATE_GUEST", "Guests", id, "Deactivated guest " + record.name);
  }
  
  return true;
}
