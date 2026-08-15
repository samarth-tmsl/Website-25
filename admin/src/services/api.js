// services/api.js
// Centralized API client for communicating with Google Apps Script Web App

// Read API URL from localStorage (user-configurable) or Vite env
export const getApiUrl = () => {
  return localStorage.getItem("samarth_cms_api_url") || import.meta.env.VITE_API_URL || "";
};

export const setApiUrl = (url) => {
  if (url) {
    localStorage.setItem("samarth_cms_api_url", url.trim());
  } else {
    localStorage.removeItem("samarth_cms_api_url");
  }
};

// Token management helpers
export const getAuthToken = () => {
  return localStorage.getItem("samarth_cms_token") || "";
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("samarth_cms_token", token);
  } else {
    localStorage.removeItem("samarth_cms_token");
  }
};

export const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem("samarth_cms_user")) || null;
  } catch(e) {
    return null;
  }
};

export const setAdminUser = (user) => {
  if (user) {
    localStorage.setItem("samarth_cms_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("samarth_cms_user");
  }
};

/**
 * Base request function
 */
async function request(action, method = "GET", payload = null) {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    throw new Error("API URL is not configured. Please set the Google Apps Script Web App URL in settings.");
  }

  // Retrieve token (either from localStorage or payload context)
  const token = getAuthToken() || (payload && (payload.token || payload.idToken)) || "";
  
  // Force POST for any authenticated admin operations to prevent URL-length CORS blocks with JWT tokens
  const usePost = (method !== "GET") || !!token || action === "verifySession";
  
  let url = `${apiUrl}?action=${action}`;
  const options = {
    method: usePost ? "POST" : "GET",
    mode: "cors",
    headers: {}
  };

  if (usePost) {
    options.headers["Content-Type"] = "text/plain;charset=utf-8";
    
    // Construct body payload ensuring token is nested inside
    const bodyObj = {
      token: token,
      ...payload
    };
    options.body = JSON.stringify(bodyObj);
  } else {
    // Public requests: append standard query parameters
    if (payload) {
      Object.keys(payload).forEach(key => {
        if (payload[key] !== undefined && payload[key] !== null) {
          url += `&${key}=${encodeURIComponent(payload[key])}`;
        }
      });
    }
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const resJson = await response.json();
    if (!resJson.success) {
      throw new Error(resJson.error?.message || "Operation failed.");
    }
    
    return resJson.data;
  } catch (err) {
    console.error("API Error details:", err);
    throw new Error(err.message || "Network request failed.");
  }
}

// Exported API Services mapping all routes in GAS
export const api = {
  // Authentication & Verification
  verifySession: (token) => request("verifySession", "GET", { token }),
  
  // Public Reads
  getSettingsPublic: () => request("getSettingsPublic"),
  getAcademicYearsPublic: () => request("getAcademicYearsPublic"),
  getTeamPublic: (params) => request("getTeam", "GET", params),
  getGuestsPublic: (params) => request("getGuests", "GET", params),
  getGalleryAlbumsPublic: (params) => request("getGalleryAlbums", "GET", params),
  getGalleryImagesPublic: (albumId) => request("getGalleryImages", "GET", { albumId }),
  getEventsPublic: (params) => request("getEvents", "GET", params),
  getSponsorsPublic: (params) => request("getSponsors", "GET", params),
  getAnnouncementsPublic: () => request("getAnnouncements"),

  // Admin CRUD Operations
  // Settings
  getSettings: () => request("adminGetSettings"),
  updateSettings: (settings) => request("updateSettings", "POST", { settings }),

  // Academic Years
  getAcademicYears: () => request("adminGetAcademicYears"),
  createAcademicYear: (data) => request("createAcademicYear", "POST", data),
  updateAcademicYear: (data) => request("updateAcademicYear", "POST", data),

  // Admins management
  getAdmins: () => request("adminGetAdmins"),
  createAdmin: (data) => request("createAdmin", "POST", data),
  updateAdmin: (data) => request("updateAdmin", "POST", data),
  deleteAdmin: (id) => request("deleteAdmin", "POST", { id }),

  // Team
  getTeam: () => request("adminGetTeam"),
  createTeamMember: (data) => request("createTeamMember", "POST", data),
  updateTeamMember: (data) => request("updateTeamMember", "POST", data),
  deleteTeamMember: (id, hardDelete = false) => request("deleteTeamMember", "POST", { id, hardDelete }),

  // Guests
  getGuests: () => request("adminGetGuests"),
  createGuest: (data) => request("createGuest", "POST", data),
  updateGuest: (data) => request("updateGuest", "POST", data),
  deleteGuest: (id, hardDelete = false) => request("deleteGuest", "POST", { id, hardDelete }),

  // Gallery Albums & Images
  getGalleryAlbums: () => request("adminGetGalleryAlbums"),
  createAlbum: (data) => request("createAlbum", "POST", data),
  updateAlbum: (data) => request("updateAlbum", "POST", data),
  deleteAlbum: (id, hardDelete = false) => request("deleteAlbum", "POST", { id, hardDelete }),
  
  getGalleryAlbumImages: () => request("adminGetGalleryImages"),
  uploadGalleryImage: (albumId, imagePayload) => request("uploadGalleryImage", "POST", { albumId: "GENERAL", image: imagePayload }),
  updateGalleryImage: (data) => request("updateGalleryImage", "POST", data),
  deleteGalleryImage: (id) => request("deleteGalleryImage", "POST", { id }),

  // Events
  getEvents: () => request("adminGetEvents"),
  createEvent: (data) => request("createEvent", "POST", data),
  updateEvent: (data) => request("updateEvent", "POST", data),
  deleteEvent: (id, hardDelete = false) => request("deleteEvent", "POST", { id, hardDelete }),

  // Announcements
  getAnnouncements: () => request("adminGetAnnouncements"),
  createAnnouncement: (data) => request("createAnnouncement", "POST", data),
  updateAnnouncement: (data) => request("updateAnnouncement", "POST", data),
  deleteAnnouncement: (id) => request("deleteAnnouncement", "POST", { id }),

  // Sponsors
  getSponsors: () => request("adminGetSponsors"),
  createSponsor: (data) => request("createSponsor", "POST", data),
  updateSponsor: (data) => request("updateSponsor", "POST", data),
  deleteSponsor: (id, hardDelete = false) => request("deleteSponsor", "POST", { id, hardDelete }),

  // Audit Logs
  getAuditLogs: () => request("adminGetAuditLogs")
};
