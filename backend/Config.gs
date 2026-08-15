// Config.gs
// Global configuration variables for the Samarth Website CMS backend

// NOTE: Replace these with the actual IDs of your Google Spreadsheet and Google Drive root folder.
// If left blank or if the script is run for the first time, you can execute the setup function to auto-create them.
var SPREADSHEET_ID = ""; 
var ROOT_FOLDER_ID = "";

var FOLDER_IDS = {
  Team: "",
  Guests: "",
  Gallery: "",
  Events: "",
  Sponsors: "",
  Misc: ""
};

// Sheet names
var SHEETS = {
  SETTINGS: "Settings",
  ADMINS: "Admins",
  ACADEMIC_YEARS: "AcademicYears",
  TEAM: "Team",
  GUESTS: "Guests",
  GALLERY_ALBUMS: "GalleryAlbums",
  GALLERY_IMAGES: "GalleryImages",
  EVENTS: "Events",
  ANNOUNCEMENTS: "Announcements",
  SPONSORS: "Sponsors",
  AUDIT_LOGS: "AuditLogs"
};

// Role access levels
var ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  EDITOR: "EDITOR"
};

// Allowed Image Mime Types
var ALLOWED_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

var MAX_FILE_SIZE_MB = 10;
