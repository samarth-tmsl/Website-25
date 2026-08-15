// AcademicYears.gs
// Controller for managing Academic Years

/**
 * Returns active academic years for dropdowns or filters on the public site
 */
function getAcademicYearsPublic() {
  var list = readAllRows(SHEETS.ACADEMIC_YEARS, true);
  var result = [];
  for (var i = 0; i < list.length; i++) {
    result.push({
      id: list[i].id,
      year: list[i].year,
      label: list[i].label,
      isCurrent: list[i].isCurrent === true || list[i].isCurrent === "TRUE" || list[i].isCurrent === 1
    });
  }
  return result;
}

/**
 * Helper to fetch the current active academic year
 */
function getActiveAcademicYear() {
  var list = readAllRows(SHEETS.ACADEMIC_YEARS, true);
  for (var i = 0; i < list.length; i++) {
    var isCurrent = list[i].isCurrent === true || list[i].isCurrent === "TRUE" || list[i].isCurrent === 1;
    if (isCurrent) {
      return list[i];
    }
  }
  return list[0] || null; // Fallback to first if none marked current
}

/**
 * Admin view of academic years
 */
function getAcademicYearsAdmin(user) {
  enforcePermission(user, "settings", "READ");
  var list = readAllRows(SHEETS.ACADEMIC_YEARS, false);
  list.sort(function(a, b) {
    return b.year.localeCompare(a.year);
  });
  return list;
}

/**
 * Creates a new Academic Year
 */
function createAcademicYearController(user, payload) {
  enforcePermission(user, "settings", "UPDATE"); // Managing academic years is settings scope
  
  if (!payload.year || !payload.label) {
    throw new Error("Missing required fields: year or label.");
  }
  
  // Verify uniqueness
  var list = readAllRows(SHEETS.ACADEMIC_YEARS, false);
  for (var i = 0; i < list.length; i++) {
    if (list[i].year === payload.year) {
      throw new Error("Academic year " + payload.year + " already exists.");
    }
  }
  
  // If this year is set as current, clear current on all other years
  var isCurrent = payload.isCurrent === true || payload.isCurrent === "TRUE" || payload.isCurrent === 1;
  if (isCurrent) {
    clearCurrentAcademicYears();
  }
  
  var newAY = {
    id: generateId("AY"),
    year: payload.year.trim(),
    label: payload.label.trim(),
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : "TRUE",
    isCurrent: isCurrent ? "TRUE" : "FALSE",
    createdAt: formatDate(new Date()),
    updatedAt: formatDate(new Date())
  };
  
  appendRow(SHEETS.ACADEMIC_YEARS, newAY);
  logAction(user.email, "CREATE_ACADEMIC_YEAR", "AcademicYears", newAY.id, "Created academic year " + newAY.year);
  
  return newAY;
}

/**
 * Updates an Academic Year
 */
function updateAcademicYearController(user, id, payload) {
  enforcePermission(user, "settings", "UPDATE");
  
  var record = findRowById(SHEETS.ACADEMIC_YEARS, id);
  if (!record) {
    throw new Error("Academic year not found.");
  }
  
  var isCurrent = payload.isCurrent === true || payload.isCurrent === "TRUE" || payload.isCurrent === 1;
  if (isCurrent && !record.isCurrent) {
    clearCurrentAcademicYears();
  }
  
  var updatedData = {
    year: payload.year !== undefined ? payload.year.trim() : record.year,
    label: payload.label !== undefined ? payload.label.trim() : record.label,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : record.active,
    isCurrent: payload.isCurrent !== undefined ? (isCurrent ? "TRUE" : "FALSE") : record.isCurrent,
    updatedAt: formatDate(new Date())
  };
  
  updateRow(SHEETS.ACADEMIC_YEARS, record._rowNum, updatedData);
  logAction(user.email, "UPDATE_ACADEMIC_YEAR", "AcademicYears", id, "Updated academic year " + updatedData.year);
  
  return updatedData;
}

/**
 * Clears the isCurrent flag on all academic years
 */
function clearCurrentAcademicYears() {
  var list = readAllRows(SHEETS.ACADEMIC_YEARS, false);
  for (var i = 0; i < list.length; i++) {
    var isCurrent = list[i].isCurrent === true || list[i].isCurrent === "TRUE" || list[i].isCurrent === 1;
    if (isCurrent) {
      updateRow(SHEETS.ACADEMIC_YEARS, list[i]._rowNum, {
        isCurrent: "FALSE",
        updatedAt: formatDate(new Date())
      });
    }
  }
}
