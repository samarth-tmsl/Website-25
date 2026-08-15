// Gallery.gs
// Controller for managing Media Gallery Photos directly (No Albums)

/**
 * Returns all active gallery images
 */
function getGalleryAlbumImagesPublic() {
  var images = readAllRows(SHEETS.GALLERY_IMAGES, true);
  var result = [];
  
  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    result.push({
      id: img.id,
      img: generateImageUrl(img.fileId),
      fileName: img.fileName,
      caption: img.caption || "Event@Samarth",
      displayOrder: Number(img.displayOrder || 999)
    });
  }
  
  result.sort(function(a, b) {
    return a.displayOrder - b.displayOrder;
  });
  
  return result;
}

// Fallback for public queries
function getGalleryAlbumsPublic() {
  return [];
}

/**
 * Admin view of all gallery images
 */
function getGalleryAlbumImagesAdmin(user) {
  enforcePermission(user, "gallery", "READ");
  var images = readAllRows(SHEETS.GALLERY_IMAGES, false);
  
  for (var i = 0; i < images.length; i++) {
    images[i].imageUrl = generateImageUrl(images[i].fileId);
  }
  
  images.sort(function(a, b) {
    return Number(a.displayOrder || 999) - Number(b.displayOrder || 999);
  });
  
  return images;
}

// Fallback for admin queries
function getGalleryAlbumsAdmin(user) {
  return [];
}

/**
 * Uploads an image directly to the gallery folder
 */
function uploadAlbumImageController(user, albumId, filePayload) {
  enforcePermission(user, "gallery", "CREATE");
  
  validateImageUpload(filePayload.base64, filePayload.fileName, filePayload.mimeType);
  var fileId = uploadFile(filePayload.base64, filePayload.fileName, filePayload.mimeType, FOLDER_IDS.Gallery || ROOT_FOLDER_ID);
  
  var newImg = {
    id: generateId("IMG"),
    albumId: "GENERAL", // default placeholder value
    fileId: fileId,
    fileName: filePayload.fileName,
    caption: filePayload.caption || "",
    displayOrder: filePayload.displayOrder !== undefined ? filePayload.displayOrder : 999,
    active: "TRUE",
    uploadedAt: formatDate(new Date()),
    uploadedBy: user.email
  };
  
  appendRow(SHEETS.GALLERY_IMAGES, newImg);
  logAction(user.email, "UPLOAD_IMAGE", "GalleryImages", newImg.id, "Uploaded photo " + newImg.fileName + " directly to Media Gallery");
  
  return newImg;
}

/**
 * Updates a gallery image metadata
 */
function updateGalleryImageController(user, id, payload) {
  enforcePermission(user, "gallery", "UPDATE");
  
  var record = findRowById(SHEETS.GALLERY_IMAGES, id);
  if (!record) {
    throw new Error("Image not found.");
  }
  
  var updatedData = {
    caption: payload.caption !== undefined ? payload.caption : record.caption,
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : record.displayOrder,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : record.active
  };
  
  updateRow(SHEETS.GALLERY_IMAGES, record._rowNum, updatedData);
  logAction(user.email, "UPDATE_IMAGE", "GalleryImages", id, "Updated photo metadata for " + record.fileName);
  
  return updatedData;
}

/**
 * Deletes a gallery image
 */
function deleteGalleryImageController(user, id) {
  enforcePermission(user, "gallery", "DELETE");
  
  var record = findRowById(SHEETS.GALLERY_IMAGES, id);
  if (!record) {
    throw new Error("Image not found.");
  }
  
  deleteFile(record.fileId);
  deleteRow(SHEETS.GALLERY_IMAGES, record._rowNum);
  logAction(user.email, "DELETE_IMAGE", "GalleryImages", id, "Deleted image " + record.fileName + " from Media Gallery");
  
  return true;
}
