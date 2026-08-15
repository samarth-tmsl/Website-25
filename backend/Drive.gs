// Drive.gs
// File storage interaction layer for Google Drive

/**
 * Gets a folder by ID or returns null if not found/accessible
 */
function getFolder(folderId) {
  try {
    return DriveApp.getFolderById(folderId);
  } catch(e) {
    return null;
  }
}

/**
 * Creates a folder inside a parent folder
 */
function createFolder(parentFolderId, folderName) {
  var parent = getFolder(parentFolderId);
  if (!parent) {
    throw new Error("Parent folder not found.");
  }
  return parent.createFolder(folderName);
}

/**
 * Uploads a base64 encoded file to a specific Drive folder
 * @param {string} base64Data 
 * @param {string} fileName 
 * @param {string} mimeType 
 * @param {string} folderId 
 * @returns {string} The created file's ID
 */
function uploadFile(base64Data, fileName, mimeType, folderId) {
  var folder = getFolder(folderId);
  if (!folder) {
    throw new Error("Target folder not found.");
  }
  
  // Clean base64 string (remove data:image/png;base64, header if present)
  var rawBase64 = base64Data;
  if (base64Data.indexOf(";base64,") !== -1) {
    rawBase64 = base64Data.split(";base64,")[1];
  }
  
  var blob = Utilities.newBlob(Utilities.base64Decode(rawBase64), mimeType, fileName);
  var file = folder.createFile(blob);
  
  // Set file permissions to public so anyone can view the images
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getId();
}

/**
 * Trashes a file from Google Drive by its file ID
 */
function deleteFile(fileId) {
  if (!fileId) return false;
  try {
    var file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    return true;
  } catch(e) {
    // If the file is already deleted or not found, fail silently
    return false;
  }
}

/**
 * Generates a stable public image-serving URL from a Google Drive File ID
 */
function generateImageUrl(fileId) {
  if (!fileId) return "";
  // Return the direct display URL
  return "https://docs.google.com/uc?export=view&id=" + fileId;
}
