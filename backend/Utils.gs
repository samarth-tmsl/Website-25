// Utils.gs
// Response and general utility helpers

/**
 * Returns a success response to the client
 * @param {Object|Array} data 
 * @returns {HtmlOutput|TextOutput}
 */
function sendSuccess(data) {
  var response = {
    success: true,
    data: data || {},
    error: null
  };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Returns an error response to the client
 * @param {string} code 
 * @param {string} message 
 * @returns {HtmlOutput|TextOutput}
 */
function sendError(code, message) {
  var response = {
    success: false,
    data: null,
    error: {
      code: code || "UNKNOWN_ERROR",
      message: message || "An unexpected error occurred"
    }
  };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Formats a Date object as ISO string or YYYY-MM-DD
 */
function formatDate(date) {
  if (!date) return "";
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

/**
 * Helper to parse JSON payload safely
 */
function parseJson(str) {
  try {
    return JSON.parse(str);
  } catch(e) {
    return null;
  }
}
