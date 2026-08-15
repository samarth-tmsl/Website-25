// Router.gs
// Router layer for dispatching API calls

/**
 * Handles incoming HTTP GET requests
 */
function routeGet(e) {
  var action = e.parameter.action;
  
  if (!action) {
    return sendError("INVALID_REQUEST", "Missing required action parameter.");
  }
  
  try {
    // ----------------------------------------------------
    // PUBLIC READ ACTIONS (No authentication required)
    // ----------------------------------------------------
    if (action === "getTeam") {
      return sendSuccess(getTeamPublic(e.parameter));
    }
    if (action === "getGuests") {
      return sendSuccess(getGuestsPublic(e.parameter));
    }
    if (action === "getGalleryAlbums") {
      return sendSuccess(getGalleryAlbumsPublic(e.parameter));
    }
    if (action === "getGalleryImages") {
      var albumId = e.parameter.albumId;
      if (!albumId) throw new Error("Missing required parameter: albumId.");
      return sendSuccess(getGalleryAlbumImagesPublic(albumId));
    }
    if (action === "getEvents") {
      return sendSuccess(getEventsPublic(e.parameter));
    }
    if (action === "getSponsors") {
      return sendSuccess(getSponsorsPublic(e.parameter));
    }
    if (action === "getAnnouncements") {
      return sendSuccess(getAnnouncementsPublic());
    }
    if (action === "getSettingsPublic") {
      return sendSuccess(getSettingsPublic());
    }
    if (action === "getAcademicYearsPublic") {
      return sendSuccess(getAcademicYearsPublic());
    }
    
    // ----------------------------------------------------
    // PROTECTED ADMIN READ ACTIONS (Authentication required)
    // ----------------------------------------------------
    var token = e.parameter.token;
    if (!token) {
      return sendError("UNAUTHORIZED", "Missing authentication token.");
    }
    var user = authenticate(token);
    
    if (action === "adminGetTeam") {
      return sendSuccess(getTeamAdmin(user));
    }
    if (action === "adminGetGuests") {
      return sendSuccess(getGuestsAdmin(user));
    }
    if (action === "adminGetGalleryAlbums") {
      return sendSuccess(getGalleryAlbumsAdmin(user));
    }
    if (action === "adminGetGalleryImages") {
      var albumId = e.parameter.albumId;
      if (!albumId) throw new Error("Missing albumId.");
      return sendSuccess(getGalleryAlbumImagesAdmin(user, albumId));
    }
    if (action === "adminGetEvents") {
      return sendSuccess(getEventsAdmin(user));
    }
    if (action === "adminGetSponsors") {
      return sendSuccess(getSponsorsAdmin(user));
    }
    if (action === "adminGetAnnouncements") {
      return sendSuccess(getAnnouncementsAdmin(user));
    }
    if (action === "adminGetSettings") {
      return sendSuccess(getSettingsAdminController(user));
    }
    if (action === "adminGetAdmins") {
      return sendSuccess(getAdminsAdminController(user));
    }
    if (action === "adminGetAcademicYears") {
      return sendSuccess(getAcademicYearsAdmin(user));
    }
    if (action === "adminGetAuditLogs") {
      return sendSuccess(getAuditLogsController(user));
    }
    if (action === "verifySession") {
      return sendSuccess({ valid: true, user: user });
    }
    
    return sendError("INVALID_ACTION", "Unknown action: " + action);
  } catch(err) {
    return sendError("SERVER_ERROR", err.message);
  }
}

/**
 * Handles incoming HTTP POST requests
 */
function routePost(e) {
  var action = e.parameter.action;
  
  if (!action) {
    return sendError("INVALID_REQUEST", "Missing required action parameter.");
  }
  
  try {
    var postData = parseJson(e.postData.contents);
    if (!postData) {
      return sendError("INVALID_PAYLOAD", "Failed to parse JSON body payload.");
    }
    
    var token = postData.token || e.parameter.token;
    if (!token) {
      return sendError("UNAUTHORIZED", "Missing authentication token.");
    }
    
    var user = authenticate(token);
    
    // Dispatch mutations
    switch (action) {
      // TEAM
      case "createTeamMember":
        return sendSuccess(createTeamMemberController(user, postData));
      case "updateTeamMember":
        if (!postData.id) throw new Error("Missing member id.");
        return sendSuccess(updateTeamMemberController(user, postData.id, postData));
      case "deleteTeamMember":
        if (!postData.id) throw new Error("Missing member id.");
        return sendSuccess(deleteTeamMemberController(user, postData.id, postData.hardDelete));
        
      // GUESTS
      case "createGuest":
        return sendSuccess(createGuestController(user, postData));
      case "updateGuest":
        if (!postData.id) throw new Error("Missing guest id.");
        return sendSuccess(updateGuestController(user, postData.id, postData));
      case "deleteGuest":
        if (!postData.id) throw new Error("Missing guest id.");
        return sendSuccess(deleteGuestController(user, postData.id, postData.hardDelete));
        
      // GALLERY
      case "createAlbum":
        return sendSuccess(createAlbumController(user, postData));
      case "updateAlbum":
        if (!postData.id) throw new Error("Missing album id.");
        return sendSuccess(updateAlbumController(user, id, postData));
      case "deleteAlbum":
        if (!postData.id) throw new Error("Missing album id.");
        return sendSuccess(deleteAlbumController(user, postData.id, postData.hardDelete));
      case "uploadGalleryImage":
        if (!postData.albumId || !postData.image) throw new Error("Missing albumId or image data.");
        return sendSuccess(uploadAlbumImageController(user, postData.albumId, postData.image));
      case "updateGalleryImage":
        if (!postData.id) throw new Error("Missing image id.");
        return sendSuccess(updateGalleryImageController(user, postData.id, postData));
      case "deleteGalleryImage":
        if (!postData.id) throw new Error("Missing image id.");
        return sendSuccess(deleteGalleryImageController(user, postData.id));
        
      // EVENTS
      case "createEvent":
        return sendSuccess(createEventController(user, postData));
      case "updateEvent":
        if (!postData.id) throw new Error("Missing event id.");
        return sendSuccess(updateEventController(user, postData.id, postData));
      case "deleteEvent":
        if (!postData.id) throw new Error("Missing event id.");
        return sendSuccess(deleteEventController(user, postData.id, postData.hardDelete));
        
      // ANNOUNCEMENTS
      case "createAnnouncement":
        return sendSuccess(createAnnouncementController(user, postData));
      case "updateAnnouncement":
        if (!postData.id) throw new Error("Missing announcement id.");
        return sendSuccess(updateAnnouncementController(user, postData.id, postData));
      case "deleteAnnouncement":
        if (!postData.id) throw new Error("Missing announcement id.");
        return sendSuccess(deleteAnnouncementController(user, postData.id));
        
      // SPONSORS
      case "createSponsor":
        return sendSuccess(createSponsorController(user, postData));
      case "updateSponsor":
        if (!postData.id) throw new Error("Missing sponsor id.");
        return sendSuccess(updateSponsorController(user, postData.id, postData));
      case "deleteSponsor":
        if (!postData.id) throw new Error("Missing sponsor id.");
        return sendSuccess(deleteSponsorController(user, postData.id, postData.hardDelete));
        
      // ADMINS
      case "createAdmin":
        return sendSuccess(createAdminController(user, postData));
      case "updateAdmin":
        if (!postData.id) throw new Error("Missing admin id.");
        return sendSuccess(updateAdminController(user, postData.id, postData));
      case "deleteAdmin":
        if (!postData.id) throw new Error("Missing admin id.");
        return sendSuccess(deleteAdminController(user, postData.id));
        
      // ACADEMIC YEARS
      case "createAcademicYear":
        return sendSuccess(createAcademicYearController(user, postData));
      case "updateAcademicYear":
        if (!postData.id) throw new Error("Missing academic year id.");
        return sendSuccess(updateAcademicYearController(user, postData.id, postData));
        
      // SETTINGS
      case "updateSettings":
        return sendSuccess(updateSettingsController(user, postData.settings));
        
      default:
        return sendError("INVALID_ACTION", "Unknown write action: " + action);
    }
  } catch(err) {
    return sendError("SERVER_ERROR", err.message);
  }
}
