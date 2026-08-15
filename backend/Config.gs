// Config.gs
// Global configuration variables for the Samarth Website CMS backend

// NOTE: Replace these with the actual IDs of your Google Spreadsheet and Google Drive root folder.
// If left blank or if the script is run for the first time, you can execute the setup function to auto-create them.
var SPREADSHEET_ID = "1-qINUkgJPso2oWhoyH4uF8ARGSEW-jsaEfpkXOsIhuk"; 
var ROOT_FOLDER_ID = "1jVTchKRWxQKQXbXtun3ZvTncKVG-QoYN";

var FOLDER_IDS = {
  Team: "1k2VlG3rmnjwaMXYEMC4kiVbImcoFo17E",
  Guests: "1h_MfEFHzFz3VBVJWikgkLEiQzfC8w4Cd",
  Gallery: "1dixZPG5xaUooXaW2-G9muXlY_fEYs_DC",
  Events: "1N3FYBKNw0glJ2f7E8iGeGIC8Xd02F1Lw",
  Sponsors: "1XI6gjaw-Pg_0KqAvbNjUdSA8sp43j-jg",
  Misc: "1dnADl-2vcd1xudApl9sILxDdLCP5KJIp"
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
