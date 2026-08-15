// src/services/api.js
// Client API layer for Samarth public website with cache-aside caching

const API_URL = import.meta.env.VITE_API_URL || "";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

// Memory cache fallback
const memoryCache = {};

/**
 * Gets cached data from sessionStorage or memory
 */
function getCache(key) {
  try {
    const cached = sessionStorage.getItem(key) || memoryCache[key];
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION_MS) {
      return null; // Cache expired
    }
    return data;
  } catch(e) {
    return memoryCache[key]?.data || null;
  }
}

/**
 * Saves data into cache
 */
function setCache(key, data) {
  const cacheObj = { data, timestamp: Date.now() };
  try {
    sessionStorage.setItem(key, JSON.stringify(cacheObj));
  } catch(e) {
    // Session storage quota might be full, fallback to memory cache
  }
  memoryCache[key] = cacheObj;
}

/**
 * Retrieves the expired cache if available during network failures
 */
function getExpiredFallback(key) {
  try {
    const cached = sessionStorage.getItem(key) || memoryCache[key];
    if (!cached) return null;
    const { data } = JSON.parse(cached);
    return data;
  } catch(e) {
    return memoryCache[key]?.data || null;
  }
}

/**
 * Fetches data from the Google Apps Script Web App API
 */
async function fetchFromApi(action, params = {}) {
  if (!API_URL) {
    throw new Error("API URL is not configured. VITE_API_URL is missing.");
  }

  // Construct cache key
  const queryStr = Object.keys(params)
    .sort()
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');
  const cacheKey = `samarth_api_${action}_${queryStr}`;

  // Check cache
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Build URL
  let url = `${API_URL}?action=${action}`;
  if (queryStr) {
    url += `&${queryStr}`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const resJson = await response.json();
    if (!resJson.success) {
      throw new Error(resJson.error?.message || "Failed to load database records.");
    }

    // Cache successful response
    setCache(cacheKey, resJson.data);
    return resJson.data;
  } catch (err) {
    console.warn(`Network error fetching action: ${action}. Checking for stale cache...`, err);
    // Try to return expired cache as fallback
    const fallbackData = getExpiredFallback(cacheKey);
    if (fallbackData) {
      console.log(`Successfully recovered stale cache fallback for action: ${action}`);
      return fallbackData;
    }
    throw err;
  }
}

// Client services
export const api = {
  getSettings: () => fetchFromApi("getSettingsPublic"),
  getAcademicYears: () => fetchFromApi("getAcademicYearsPublic"),
  
  getTeam: (academicYear = "", wing = "") => {
    const params = {};
    if (academicYear) params.academicYear = academicYear;
    if (wing) params.wing = wing;
    return fetchFromApi("getTeam", params);
  },

  getGuests: (academicYear = "", eventId = "") => {
    const params = {};
    if (academicYear) params.academicYear = academicYear;
    if (eventId) params.eventId = eventId;
    return fetchFromApi("getGuests", params);
  },

  getGalleryAlbums: (academicYear = "") => {
    const params = {};
    if (academicYear) params.academicYear = academicYear;
    return fetchFromApi("getGalleryAlbums", params);
  },

  getGalleryImages: (albumId) => {
    if (!albumId) return Promise.resolve([]);
    return fetchFromApi("getGalleryImages", { albumId });
  },

  getEvents: (academicYear = "") => {
    const params = {};
    if (academicYear) params.academicYear = academicYear;
    return fetchFromApi("getEvents", params);
  },

  getSponsors: (academicYear = "") => {
    const params = {};
    if (academicYear) params.academicYear = academicYear;
    return fetchFromApi("getSponsors", params);
  },

  getAnnouncements: () => fetchFromApi("getAnnouncements")
};
