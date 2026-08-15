// Team.gs
// Controller for managing Team Members

/**
 * Returns active team members for the public client
 */
function getTeamPublic(params) {
  var members = readAllRows(SHEETS.TEAM, true);
  
  // Filter by academic year if provided, otherwise filter by the active/current year
  var targetYear = params.academicYear;
  if (!targetYear) {
    var activeYearObj = getActiveAcademicYear();
    if (activeYearObj) {
      targetYear = activeYearObj.year;
    }
  }
  
  var result = [];
  for (var i = 0; i < members.length; i++) {
    var m = members[i];
    
    // Filters
    if (targetYear && m.academicYear !== targetYear) continue;
    if (params.wing && m.wing !== params.wing) continue;
    
    result.push({
      id: m.id,
      academicYear: m.academicYear,
      wing: m.wing,
      name: m.name,
      position: m.position,
      bio: m.bio,
      image: generateImageUrl(m.imageFileId),
      linkedin: m.linkedin,
      github: m.github,
      instagram: m.instagram,
      email: m.email,
      displayOrder: Number(m.displayOrder || 999)
    });
  }
  
  // Sort by displayOrder ascending
  result.sort(function(a, b) {
    return a.displayOrder - b.displayOrder;
  });
  
  return result;
}

/**
 * Returns all team members for administrators
 */
function getTeamAdmin(user) {
  enforcePermission(user, "team", "READ");
  var members = readAllRows(SHEETS.TEAM, false);
  
  // Enrich with image URLs for admin preview
  for (var i = 0; i < members.length; i++) {
    members[i].imageUrl = generateImageUrl(members[i].imageFileId);
  }
  
  // Sort by academicYear desc, displayOrder asc
  members.sort(function(a, b) {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return Number(a.displayOrder || 999) - Number(b.displayOrder || 999);
  });
  
  return members;
}

/**
 * Creates a new team member
 */
function createTeamMemberController(user, payload) {
  enforcePermission(user, "team", "CREATE");
  
  if (!payload.name || !payload.position || !payload.academicYear) {
    throw new Error("Missing required fields: name, position, or academicYear.");
  }
  
  var imageFileId = "";
  if (payload.image) {
    validateImageUpload(payload.image.base64, payload.image.fileName, payload.image.mimeType);
    imageFileId = uploadFile(payload.image.base64, payload.image.fileName, payload.image.mimeType, FOLDER_IDS.Team || ROOT_FOLDER_ID);
  }
  
  var newMember = {
    id: generateId("TEAM"),
    academicYear: payload.academicYear,
    wing: payload.wing || "",
    name: payload.name,
    position: payload.position,
    bio: payload.bio || "",
    imageFileId: imageFileId,
    linkedin: payload.linkedin || "",
    github: payload.github || "",
    instagram: payload.instagram || "",
    email: payload.email || "",
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : 999,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : "TRUE",
    createdAt: formatDate(new Date()),
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  appendRow(SHEETS.TEAM, newMember);
  logAction(user.email, "CREATE_TEAM_MEMBER", "Team", newMember.id, "Created team member " + newMember.name);
  
  return newMember;
}

/**
 * Updates an existing team member
 */
function updateTeamMemberController(user, id, payload) {
  enforcePermission(user, "team", "UPDATE");
  
  var record = findRowById(SHEETS.TEAM, id);
  if (!record) {
    throw new Error("Team member not found.");
  }
  
  var imageFileId = record.imageFileId;
  var oldImageFileId = "";
  
  if (payload.image) {
    validateImageUpload(payload.image.base64, payload.image.fileName, payload.image.mimeType);
    oldImageFileId = record.imageFileId; // Keep to delete optionally
    imageFileId = uploadFile(payload.image.base64, payload.image.fileName, payload.image.mimeType, FOLDER_IDS.Team || ROOT_FOLDER_ID);
  }
  
  var updatedData = {
    academicYear: payload.academicYear !== undefined ? payload.academicYear : record.academicYear,
    wing: payload.wing !== undefined ? payload.wing : record.wing,
    name: payload.name !== undefined ? payload.name : record.name,
    position: payload.position !== undefined ? payload.position : record.position,
    bio: payload.bio !== undefined ? payload.bio : record.bio,
    imageFileId: imageFileId,
    linkedin: payload.linkedin !== undefined ? payload.linkedin : record.linkedin,
    github: payload.github !== undefined ? payload.github : record.github,
    instagram: payload.instagram !== undefined ? payload.instagram : record.instagram,
    email: payload.email !== undefined ? payload.email : record.email,
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : record.displayOrder,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : record.active,
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  updateRow(SHEETS.TEAM, record._rowNum, updatedData);
  logAction(user.email, "UPDATE_TEAM_MEMBER", "Team", id, "Updated team member " + updatedData.name);
  
  // Clean up old image if requested and exists
  if (oldImageFileId && payload.deleteOldImage === true) {
    deleteFile(oldImageFileId);
  }
  
  return updatedData;
}

/**
 * Deactivates or deletes a team member
 */
function deleteTeamMemberController(user, id, hardDelete) {
  enforcePermission(user, "team", "DELETE");
  
  var record = findRowById(SHEETS.TEAM, id);
  if (!record) {
    throw new Error("Team member not found.");
  }
  
  if (hardDelete === true || hardDelete === "true") {
    // Delete file from Drive
    if (record.imageFileId) {
      deleteFile(record.imageFileId);
    }
    deleteRow(SHEETS.TEAM, record._rowNum);
    logAction(user.email, "DELETE_TEAM_MEMBER", "Team", id, "Permanently deleted team member " + record.name);
  } else {
    // Soft delete / deactivate
    updateRow(SHEETS.TEAM, record._rowNum, {
      active: "FALSE",
      updatedAt: formatDate(new Date()),
      updatedBy: user.email
    });
    logAction(user.email, "DEACTIVATE_TEAM_MEMBER", "Team", id, "Deactivated team member " + record.name);
  }
  
  return true;
}
