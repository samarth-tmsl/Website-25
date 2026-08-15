// Validation.gs
// Input and data validation helper rules

/**
 * Validates a base64 image upload payload
 */
function validateImageUpload(base64Data, fileName, mimeType) {
  if (!base64Data || !fileName || !mimeType) {
    throw new Error("Missing required file parameters.");
  }
  
  if (!ALLOWED_MIME_TYPES[mimeType.toLowerCase()]) {
    throw new Error("Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP.");
  }
  
  // Calculate size in MB from base64 representation (~3/4 bytes per base64 character)
  var rawBase64 = base64Data;
  if (base64Data.indexOf(";base64,") !== -1) {
    rawBase64 = base64Data.split(";base64,")[1];
  }
  var sizeInBytes = (rawBase64.length * 3) / 4;
  var sizeInMb = sizeInBytes / (1024 * 1024);
  
  if (sizeInMb > MAX_FILE_SIZE_MB) {
    throw new Error("File size exceeds the limit of " + MAX_FILE_SIZE_MB + "MB.");
  }
  
  return true;
}

/**
 * Simple email validator
 */
function validateEmail(email) {
  if (!email) return false;
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validates slug for events
 */
function validateSlug(slug) {
  if (!slug) return false;
  var re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return re.test(slug.trim());
}
