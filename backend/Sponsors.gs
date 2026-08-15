// Sponsors.gs
// Controller for managing Club Sponsors and Partners

/**
 * Returns active sponsors for public client
 */
function getSponsorsPublic(params) {
  var sponsors = readAllRows(SHEETS.SPONSORS, true);
  
  var result = [];
  for (var i = 0; i < sponsors.length; i++) {
    var sp = sponsors[i];
    
    if (params.academicYear && sp.academicYear !== params.academicYear) continue;
    if (params.tier && sp.tier !== params.tier) continue;
    
    result.push({
      id: sp.id,
      academicYear: sp.academicYear,
      name: sp.name,
      img: generateImageUrl(sp.logoFileId),
      website: sp.website,
      description: sp.description,
      tier: sp.tier || "General",
      displayOrder: Number(sp.displayOrder || 999)
    });
  }
  
  result.sort(function(a, b) {
    return a.displayOrder - b.displayOrder;
  });
  
  return result;
}

/**
 * Admin view of sponsors
 */
function getSponsorsAdmin(user) {
  enforcePermission(user, "sponsors", "READ");
  var sponsors = readAllRows(SHEETS.SPONSORS, false);
  
  for (var i = 0; i < sponsors.length; i++) {
    sponsors[i].logoUrl = generateImageUrl(sponsors[i].logoFileId);
  }
  
  sponsors.sort(function(a, b) {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return Number(a.displayOrder || 999) - Number(b.displayOrder || 999);
  });
  
  return sponsors;
}

/**
 * Creates a new sponsor entry
 */
function createSponsorController(user, payload) {
  enforcePermission(user, "sponsors", "CREATE");
  
  if (!payload.name || !payload.academicYear) {
    throw new Error("Missing required fields: name or academicYear.");
  }
  
  var logoFileId = "";
  if (payload.logo) {
    validateImageUpload(payload.logo.base64, payload.logo.fileName, payload.logo.mimeType);
    logoFileId = uploadFile(payload.logo.base64, payload.logo.fileName, payload.logo.mimeType, FOLDER_IDS.Sponsors || ROOT_FOLDER_ID);
  }
  
  var newSponsor = {
    id: generateId("SPONSOR"),
    academicYear: payload.academicYear,
    name: payload.name,
    logoFileId: logoFileId,
    website: payload.website || "",
    description: payload.description || "",
    tier: payload.tier || "General",
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : 999,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : "TRUE",
    createdAt: formatDate(new Date()),
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  appendRow(SHEETS.SPONSORS, newSponsor);
  logAction(user.email, "CREATE_SPONSOR", "Sponsors", newSponsor.id, "Created sponsor " + newSponsor.name);
  
  return newSponsor;
}

/**
 * Updates a sponsor entry
 */
function updateSponsorController(user, id, payload) {
  enforcePermission(user, "sponsors", "UPDATE");
  
  var record = findRowById(SHEETS.SPONSORS, id);
  if (!record) {
    throw new Error("Sponsor not found.");
  }
  
  var logoFileId = record.logoFileId;
  var oldLogoFileId = "";
  
  if (payload.logo) {
    validateImageUpload(payload.logo.base64, payload.logo.fileName, payload.logo.mimeType);
    oldLogoFileId = record.logoFileId;
    logoFileId = uploadFile(payload.logo.base64, payload.logo.fileName, payload.logo.mimeType, FOLDER_IDS.Sponsors || ROOT_FOLDER_ID);
  }
  
  var updatedData = {
    academicYear: payload.academicYear !== undefined ? payload.academicYear : record.academicYear,
    name: payload.name !== undefined ? payload.name : record.name,
    logoFileId: logoFileId,
    website: payload.website !== undefined ? payload.website : record.website,
    description: payload.description !== undefined ? payload.description : record.description,
    tier: payload.tier !== undefined ? payload.tier : record.tier,
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : record.displayOrder,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : record.active,
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  updateRow(SHEETS.SPONSORS, record._rowNum, updatedData);
  logAction(user.email, "UPDATE_SPONSOR", "Sponsors", id, "Updated sponsor " + updatedData.name);
  
  if (oldLogoFileId && payload.deleteOldImage === true) {
    deleteFile(oldLogoFileId);
  }
  
  return updatedData;
}

/**
 * Deletes or deactivates a sponsor entry
 */
function deleteSponsorController(user, id, hardDelete) {
  enforcePermission(user, "sponsors", "DELETE");
  
  var record = findRowById(SHEETS.SPONSORS, id);
  if (!record) {
    throw new Error("Sponsor not found.");
  }
  
  if (hardDelete === true || hardDelete === "true") {
    if (record.logoFileId) {
      deleteFile(record.logoFileId);
    }
    deleteRow(SHEETS.SPONSORS, record._rowNum);
    logAction(user.email, "DELETE_SPONSOR", "Sponsors", id, "Permanently deleted sponsor " + record.name);
  } else {
    updateRow(SHEETS.SPONSORS, record._rowNum, {
      active: "FALSE",
      updatedAt: formatDate(new Date()),
      updatedBy: user.email
    });
    logAction(user.email, "DEACTIVATE_SPONSOR", "Sponsors", id, "Deactivated sponsor " + record.name);
  }
  
  return true;
}
