// Gallery.gs
// Controller for managing Gallery Albums and Photos

/**
 * Returns list of active gallery albums
 */
function getGalleryAlbumsPublic(params) {
  var albums = readAllRows(SHEETS.GALLERY_ALBUMS, true);
  
  var result = [];
  for (var i = 0; i < albums.length; i++) {
    var a = albums[i];
    
    if (params.academicYear && a.academicYear !== params.academicYear) continue;
    
    result.push({
      id: a.id,
      academicYear: a.academicYear,
      title: a.title,
      description: a.description,
      eventId: a.eventId,
      coverImage: generateImageUrl(a.coverImageId),
      displayOrder: Number(a.displayOrder || 999)
    });
  }
  
  result.sort(function(a, b) {
    return a.displayOrder - b.displayOrder;
  });
  
  return result;
}

/**
 * Returns images inside a specific album
 */
function getGalleryAlbumImagesPublic(albumId) {
  var images = readAllRows(SHEETS.GALLERY_IMAGES, true);
  var result = [];
  
  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    if (img.albumId === albumId) {
      result.push({
        id: img.id,
        img: generateImageUrl(img.fileId),
        fileName: img.fileName,
        caption: img.caption || "Event@Samarth",
        displayOrder: Number(img.displayOrder || 999)
      });
    }
  }
  
  result.sort(function(a, b) {
    return a.displayOrder - b.displayOrder;
  });
  
  return result;
}

/**
 * Admin view of albums
 */
function getGalleryAlbumsAdmin(user) {
  enforcePermission(user, "gallery", "READ");
  var albums = readAllRows(SHEETS.GALLERY_ALBUMS, false);
  
  for (var i = 0; i < albums.length; i++) {
    albums[i].coverImageUrl = generateImageUrl(albums[i].coverImageId);
  }
  
  albums.sort(function(a, b) {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return Number(a.displayOrder || 999) - Number(b.displayOrder || 999);
  });
  
  return albums;
}

/**
 * Admin view of album images
 */
function getGalleryAlbumImagesAdmin(user, albumId) {
  enforcePermission(user, "gallery", "READ");
  var images = readAllRows(SHEETS.GALLERY_IMAGES, false);
  var result = [];
  
  for (var i = 0; i < images.length; i++) {
    if (images[i].albumId === albumId) {
      var img = images[i];
      img.imageUrl = generateImageUrl(img.fileId);
      result.push(img);
    }
  }
  
  result.sort(function(a, b) {
    return Number(a.displayOrder || 999) - Number(b.displayOrder || 999);
  });
  
  return result;
}

/**
 * Create a new album
 */
function createAlbumController(user, payload) {
  enforcePermission(user, "gallery", "CREATE");
  
  if (!payload.title || !payload.academicYear) {
    throw new Error("Missing required fields: title or academicYear.");
  }
  
  var coverImageId = "";
  if (payload.coverImage) {
    validateImageUpload(payload.coverImage.base64, payload.coverImage.fileName, payload.coverImage.mimeType);
    coverImageId = uploadFile(payload.coverImage.base64, payload.coverImage.fileName, payload.coverImage.mimeType, FOLDER_IDS.Gallery || ROOT_FOLDER_ID);
  }
  
  var newAlbum = {
    id: generateId("ALBUM"),
    academicYear: payload.academicYear,
    title: payload.title,
    description: payload.description || "",
    eventId: payload.eventId || "",
    coverImageId: coverImageId,
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : 999,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : "TRUE",
    createdAt: formatDate(new Date()),
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  appendRow(SHEETS.GALLERY_ALBUMS, newAlbum);
  logAction(user.email, "CREATE_ALBUM", "GalleryAlbums", newAlbum.id, "Created gallery album " + newAlbum.title);
  
  return newAlbum;
}

/**
 * Updates an album
 */
function updateAlbumController(user, id, payload) {
  enforcePermission(user, "gallery", "UPDATE");
  
  var record = findRowById(SHEETS.GALLERY_ALBUMS, id);
  if (!record) {
    throw new Error("Album not found.");
  }
  
  var coverImageId = record.coverImageId;
  var oldCoverImageId = "";
  
  if (payload.coverImage) {
    validateImageUpload(payload.coverImage.base64, payload.coverImage.fileName, payload.coverImage.mimeType);
    oldCoverImageId = record.coverImageId;
    coverImageId = uploadFile(payload.coverImage.base64, payload.coverImage.fileName, payload.coverImage.mimeType, FOLDER_IDS.Gallery || ROOT_FOLDER_ID);
  }
  
  var updatedData = {
    academicYear: payload.academicYear !== undefined ? payload.academicYear : record.academicYear,
    title: payload.title !== undefined ? payload.title : record.title,
    description: payload.description !== undefined ? payload.description : record.description,
    eventId: payload.eventId !== undefined ? payload.eventId : record.eventId,
    coverImageId: coverImageId,
    displayOrder: payload.displayOrder !== undefined ? payload.displayOrder : record.displayOrder,
    active: payload.active !== undefined ? String(payload.active).toUpperCase() : record.active,
    updatedAt: formatDate(new Date()),
    updatedBy: user.email
  };
  
  updateRow(SHEETS.GALLERY_ALBUMS, record._rowNum, updatedData);
  logAction(user.email, "UPDATE_ALBUM", "GalleryAlbums", id, "Updated gallery album " + updatedData.title);
  
  if (oldCoverImageId && payload.deleteOldImage === true) {
    deleteFile(oldCoverImageId);
  }
  
  return updatedData;
}

/**
 * Deletes or deactivates an album
 */
function deleteAlbumController(user, id, hardDelete) {
  enforcePermission(user, "gallery", "DELETE");
  
  var record = findRowById(SHEETS.GALLERY_ALBUMS, id);
  if (!record) {
    throw new Error("Album not found.");
  }
  
  if (hardDelete === true || hardDelete === "true") {
    if (record.coverImageId) {
      deleteFile(record.coverImageId);
    }
    
    // Also delete all images associated with this album
    var images = readAllRows(SHEETS.GALLERY_IMAGES, false);
    for (var i = 0; i < images.length; i++) {
      if (images[i].albumId === id) {
        deleteFile(images[i].fileId);
        deleteRow(SHEETS.GALLERY_IMAGES, images[i]._rowNum);
      }
    }
    
    deleteRow(SHEETS.GALLERY_ALBUMS, record._rowNum);
    logAction(user.email, "DELETE_ALBUM", "GalleryAlbums", id, "Permanently deleted album " + record.title);
  } else {
    updateRow(SHEETS.GALLERY_ALBUMS, record._rowNum, {
      active: "FALSE",
      updatedAt: formatDate(new Date()),
      updatedBy: user.email
    });
    logAction(user.email, "DEACTIVATE_ALBUM", "GalleryAlbums", id, "Deactivated album " + record.title);
  }
  
  return true;
}

/**
 * Uploads an image to an album
 */
function uploadAlbumImageController(user, albumId, filePayload) {
  enforcePermission(user, "gallery", "CREATE");
  
  validateImageUpload(filePayload.base64, filePayload.fileName, filePayload.mimeType);
  var fileId = uploadFile(filePayload.base64, filePayload.fileName, filePayload.mimeType, FOLDER_IDS.Gallery || ROOT_FOLDER_ID);
  
  var newImg = {
    id: generateId("IMG"),
    albumId: albumId,
    fileId: fileId,
    fileName: filePayload.fileName,
    caption: filePayload.caption || "",
    displayOrder: filePayload.displayOrder !== undefined ? filePayload.displayOrder : 999,
    active: "TRUE",
    uploadedAt: formatDate(new Date()),
    uploadedBy: user.email
  };
  
  appendRow(SHEETS.GALLERY_IMAGES, newImg);
  logAction(user.email, "UPLOAD_IMAGE", "GalleryImages", newImg.id, "Uploaded photo " + newImg.fileName + " to album " + albumId);
  
  return newImg;
}

/**
 * Updates a gallery image metadata (caption or displayOrder)
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
  logAction(user.email, "DELETE_IMAGE", "GalleryImages", id, "Deleted image " + record.fileName + " from album " + record.albumId);
  
  return true;
}
