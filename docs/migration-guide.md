# Data Migration & Database Seeding Guide

This guide explains how to migrate and populate the historical database records (Team members, Sponsors, Guests, and Events) from this repository into Google Sheets and Google Drive.

---

## Option 1: Automated Migration Script (Recommended)

To automate downloading images, uploading them to Google Drive, and populating Google Sheets with correct database mappings, you can use the script below.

### Step 1: Add the Data Seed Module to Apps Script
1. In your Google Apps Script editor, create a new file named `DataSeeds.gs`.
2. Copy and paste the script below into `DataSeeds.gs`.
3. Open `Config.gs` to ensure your `SPREADSHEET_ID`, `ROOT_FOLDER_ID`, and subfolder IDs are configured.

```javascript
/**
 * DataSeeds.gs
 * Automated database seeding script for Samarth Website CMS
 */

// GitHub Raw URL prefix for asset downloads
const GITHUB_ASSET_BASE = "https://raw.githubusercontent.com/samarth-tmsl/Website-25/main/public";

function runMigration() {
  Logger.log("Starting data migration...");
  
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Resolve folders dynamically if IDs are not configured/placeholder
  var rootFolder;
  try {
    rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  } catch(e) {
    // Search by name "Samarth Website" in Drive or use root
    var roots = DriveApp.getFoldersByName("Samarth Website");
    rootFolder = roots.hasNext() ? roots.next() : DriveApp.getRootFolder();
  }

  // Resolve target folders safely
  var teamFolder = getFolderSafe(FOLDER_IDS.Team, "Team", rootFolder);
  var sponsorFolder = getFolderSafe(FOLDER_IDS.Sponsors, "Sponsors", rootFolder);
  var eventFolder = getFolderSafe(FOLDER_IDS.Events, "Events", rootFolder);
  var guestFolder = getFolderSafe(FOLDER_IDS.Guests, "Guests", rootFolder);
  var galleryFolder = getFolderSafe(FOLDER_IDS.Gallery, "Gallery", rootFolder);

  // 1. Create Academic Years
  var years = [
    { id: "AY_000001", year: "2023-24", label: "Academic Year 2023-24", active: "TRUE", isCurrent: "FALSE" },
    { id: "AY_000002", year: "2024-25", label: "Academic Year 2024-25", active: "TRUE", isCurrent: "FALSE" },
    { id: "AY_000003", year: "2025-26", label: "Academic Year 2025-26", active: "TRUE", isCurrent: "FALSE" },
    { id: "AY_000004", year: "2026-27", label: "Academic Year 2026-27", active: "TRUE", isCurrent: "TRUE" }
  ];
  
  var yearSheet = ss.getSheetByName(SHEETS.ACADEMIC_YEARS);
  yearSheet.clearContents();
  yearSheet.appendRow(["id", "year", "label", "active", "isCurrent", "createdAt", "updatedAt"]);
  years.forEach(function(y) {
    yearSheet.appendRow([y.id, y.year, y.label, y.active, y.isCurrent, new Date().toISOString(), new Date().toISOString()]);
  });
  Logger.log("Academic Years seeded.");

  // 2. Seed Sponsors / Partners
  var sponsors = [
    { name: "Rapido", imagePath: "/images2/logo/rapido.webp", website: "https://rapido.xyz" },
    { name: "TIME Institute", imagePath: "/images2/logo/time.webp", website: "https://time4education.com" },
    { name: "RICE Education", imagePath: "/images2/logo/rice.webp", website: "https://riceeducation.com" },
    { name: "Kwipic", imagePath: "/images2/logo/kwicpic.webp", website: "" },
    { name: "LWT Academy", imagePath: "/images2/logo/lwt.webp", website: "https://learningwhiletravelling.com" },
    { name: "Sconto", imagePath: "/images2/logo/sconto.webp", website: "https://sconto.co.in" },
    { name: "Winni Flowers", imagePath: "/images2/logo/winni.webp", website: "https://winni.in" }
  ];

  var sponsorSheet = ss.getSheetByName(SHEETS.SPONSORS);
  sponsorSheet.clearContents();
  sponsorSheet.appendRow(["id", "academicYear", "name", "logoFileId", "website", "description", "tier", "displayOrder", "active", "createdAt", "updatedAt", "updatedBy"]);
  
  sponsors.forEach(function(s, index) {
    var fileId = uploadImageFromUrl(GITHUB_ASSET_BASE + s.imagePath, s.name + "_logo.webp", sponsorFolder);
    sponsorSheet.appendRow([
      "SPONSOR_" + (100000 + index),
      "2026-27",
      s.name,
      fileId,
      s.website,
      "Official Event Partner",
      "Silver",
      index + 1,
      "TRUE",
      new Date().toISOString(),
      new Date().toISOString(),
      "Migration-Script"
    ]);
  });
  Logger.log("Sponsors seeded.");

  // 3. Seed Faculty & Core Team
  var teamMembers = [
    // Faculty Advisors
    { name: "Prof. Hemant Agarwal", position: "Assistant Professor, Dept. of EE", wing: "Committee", img: "/images2/Team/teacher4.webp" },
    { name: "Prof. Rituparna Ganguly", position: "Assistant Professor, Dept. of English", wing: "Committee", img: "/images2/Team/Rituparna.webp" },
    { name: "Prof. Gourav Ghosh", position: "Assistant Professor, Dept. of CE", wing: "Committee", img: "/images2/Team/Gourav.webp" },
    { name: "Prof. Ayesha Sultana", position: "Assistant Professor, Dept. of ECE", wing: "Committee", img: "/images2/Team/teacher1.webp" },
    { name: "Dr. Dipen Ganguly", position: "Assistant Professor, Dept. of Maths", wing: "Committee", img: "/images2/Team/teacher5.webp" },
    
    // Core Leads (Heads/Co-Heads)
    { name: "Anish Agarwal", position: "Convener & Sponsor Head", wing: "Committee", img: "/images2/dataTeam2/img2.webp", email: "anishagarwal670@gmail.com" },
    { name: "Chandika Sarkar", position: "Event coordinator", wing: "Committee", img: "/images2/dataTeam2/img3.webp", email: "chandikasarkar5@gmail.com" },
    { name: "Dhawal S Shah", position: "Treasurer & Prakaran Head", wing: "Committee", img: "/images2/dataTeam2/img4.webp", email: "dhawalshah910@gmail.com" },
    { name: "Sunny Kumar", position: "Kalakriti Head", wing: "Design", img: "/images2/dataTeam2/img5.webp", email: "sundayroj@gmail.com" },
    { name: "Tanu Priya", position: "Decoration Head", wing: "Operations", img: "/images2/dataTeam2/img6.webp", email: "tanupd04@gmail.com" },
    { name: "Arnab Gupta", position: "Kalakriti Head", wing: "Design", img: "/images2/dataTeam2/img7.webp", email: "arnabgupta983@gmail.com" },
    { name: "Raj De Modak", position: "Ignite & Gyan Darpan Head", wing: "PR & Editorial", img: "/images2/dataTeam2/img8.webp", email: "rajgobindadham@gmail.com" }
  ];

  var teamSheet = ss.getSheetByName(SHEETS.TEAM);
  teamSheet.clearContents();
  teamSheet.appendRow(["id", "academicYear", "wing", "name", "position", "bio", "imageFileId", "linkedin", "github", "instagram", "email", "displayOrder", "active", "createdAt", "updatedAt", "updatedBy"]);
  
  teamMembers.forEach(function(m, index) {
    var fileId = uploadImageFromUrl(GITHUB_ASSET_BASE + m.img, m.name + ".webp", teamFolder);
    teamSheet.appendRow([
      "TEAM_" + (100000 + index),
      "2026-27",
      m.wing,
      m.name,
      m.position,
      "Core Student Committee Member",
      fileId,
      "https://linkedin.com",
      "https://github.com",
      "",
      m.email || "",
      index + 1,
      "TRUE",
      new Date().toISOString(),
      new Date().toISOString(),
      "Migration-Script"
    ]);
  });
  Logger.log("Team members seeded.");

  // 4. Seed Safalya '26 Events
  var events = [
    { title: "Safalya '26", slug: "safalya-26", img: "/images2/safalya-2026/Combine.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Apti Acumen", slug: "apti-acumen", img: "/images2/safalya-2026/Apti Acumen.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Brain Blitz", slug: "brain-blitz", img: "/images2/safalya-2026/Brain Blitz.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Echoes of History", slug: "echoes-of-history", img: "/images2/safalya-2026/Echoes of history.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Innovathon", slug: "innovathon", img: "/images2/safalya-2026/Innovathon.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Instant Ink", slug: "instant-ink", img: "/images2/safalya-2026/Instant Ink.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Matrix of Mock", slug: "matrix-of-mock", img: "/images2/safalya-2026/Matrix Of Mock.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Model United States", slug: "model-united-states", img: "/images2/safalya-2026/Model United States.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Reimagine a Book Cover", slug: "reimagine-book-cover", img: "/images2/safalya-2026/Reimagine book cover.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Sherlock Escape", slug: "sherlock-escape", img: "/images2/safalya-2026/Sherlock Escape.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Shot a Reel", slug: "shot-a-reel", img: "/images2/safalya-2026/Shot A reel.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Snap Flicks", slug: "snap-flicks", img: "/images2/safalya-2026/Snap Flicks.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Suit and Strat", slug: "suit-and-strat", img: "/images2/safalya-2026/Suit and Strat.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" },
    { title: "Triathlon", slug: "triathlon", img: "/images2/safalya-2026/Triathlon.webp", registrationUrl: "https://forms.gle/q1hMgxnxiu64msWk8" }
  ];

  var eventSheet = ss.getSheetByName(SHEETS.EVENTS);
  eventSheet.clearContents();
  eventSheet.appendRow(["id", "academicYear", "title", "slug", "description", "date", "startTime", "endTime", "venue", "posterFileId", "registrationUrl", "status", "displayOrder", "active", "createdAt", "updatedAt", "updatedBy"]);
  
  events.forEach(function(ev, index) {
    var fileId = uploadImageFromUrl(GITHUB_ASSET_BASE + ev.img, ev.slug + "_poster.webp", eventFolder);
    eventSheet.appendRow([
      "EVENT_" + (100000 + index),
      "2026-27",
      ev.title,
      ev.slug,
      "Exciting technical and cultural event hosted under Safalya '26.",
      "2026-03-15",
      "10:00 AM",
      "04:00 PM",
      "Main Campus Auditorium",
      fileId,
      ev.registrationUrl,
      "UPCOMING",
      index + 1,
      "TRUE",
      new Date().toISOString(),
      new Date().toISOString(),
      "Migration-Script"
    ]);
  });
  Logger.log("Events seeded.");

  // 5. Seed Guest Speakers
  var guests = [
    { name: "Dr. APJ Abdul Kalam", designation: "Former President of India", organization: "Government of India", img: "/images2/Team/avatar.png" },
    { name: "Sundar Pichai", designation: "CEO", organization: "Alphabet & Google", img: "/images2/Team/avatar.png" }
  ];

  var guestSheet = ss.getSheetByName(SHEETS.GUESTS);
  guestSheet.clearContents();
  guestSheet.appendRow(["id", "academicYear", "eventId", "name", "designation", "organization", "description", "imageFileId", "displayOrder", "active", "createdAt", "updatedAt", "updatedBy"]);
  
  guests.forEach(function(g, index) {
    var fileId = uploadImageFromUrl(GITHUB_ASSET_BASE + g.img, g.name + "_avatar.png", guestFolder);
    guestSheet.appendRow([
      "GUEST_" + (100000 + index),
      "2026-27",
      "EVENT_100000",
      g.name,
      g.designation,
      g.organization,
      "Invited guest speaker for campus keynotes.",
      fileId,
      index + 1,
      "TRUE",
      new Date().toISOString(),
      new Date().toISOString(),
      "Migration-Script"
    ]);
  });
  Logger.log("Guests seeded.");

  // 6. Seed Gallery Images
  var galleryImages = [
    { filename: "gallery_1.webp", img: "/images2/gallery/1.webp", caption: "Cultural Night Performance" },
    { filename: "gallery_2.webp", img: "/images2/gallery/2.webp", caption: "Coding Contest Winners" },
    { filename: "gallery_3.webp", img: "/images2/gallery/3.webp", caption: "Robotics Exhibition" },
    { filename: "gallery_4.webp", img: "/images2/gallery/4.webp", caption: "Campus Decoration" },
    { filename: "gallery_5.webp", img: "/images2/gallery/5.webp", caption: "Auditorium Opening" }
  ];

  var gallerySheet = ss.getSheetByName(SHEETS.GALLERY_IMAGES);
  gallerySheet.clearContents();
  gallerySheet.appendRow(["id", "albumId", "fileId", "fileName", "caption", "displayOrder", "active", "uploadedAt", "uploadedBy"]);
  
  galleryImages.forEach(function(img, index) {
    var fileId = uploadImageFromUrl(GITHUB_ASSET_BASE + img.img, img.filename, galleryFolder);
    gallerySheet.appendRow([
      "IMG_" + (100000 + index),
      "GENERAL",
      fileId,
      img.filename,
      img.caption,
      index + 1,
      "TRUE",
      new Date().toISOString(),
      "Migration-Script"
    ]);
  });
  Logger.log("Gallery images seeded successfully!");
}

/**
 * Resolves a folder safely, falling back to name search inside parent if ID is not configured
 */
function getFolderSafe(configuredId, folderName, parentFolder) {
  if (configuredId && configuredId !== "..." && configuredId.trim() !== "") {
    try {
      return DriveApp.getFolderById(configuredId);
    } catch(e) {
      Logger.log("Invalid ID for " + folderName + ". Finding by name...");
    }
  }
  
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

/**
 * Downloads image from URL and saves to Google Drive returning public file ID
 */
function uploadImageFromUrl(url, filename, folder) {
  try {
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() === 200) {
      var blob = response.getBlob().setName(filename);
      var file = folder.createFile(blob);
      try {
        file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
      } catch(sharingErr) {
        Logger.log("Could not set public sharing (normal for Workspace domains): " + sharingErr.message);
      }
      return file.getId();
    }
  } catch(e) {
    Logger.log("Failed to download: " + url + " - " + e.message);
  }
  return ""; // Return blank if download fails
}
```

### Step 2: Run the Migration Function
1. In the Apps Script toolbar, select the `runMigration` function from the dropdown.
2. Click **Run**.
3. Grant any requested scopes permissions.
4. Open your spreadsheet and verify that data now populates the **AcademicYears**, **Sponsors**, and **Team** sheets with public file links!

---

## Option 2: Manual Migration

If you prefer uploading assets manually:

### 1. Upload Assets to Google Drive
1. Locate the folders created during installation under your root Drive directory:
   - `Samarth Website/Team`
   - `Samarth Website/Guests`
   - `Samarth Website/Events`
   - `Samarth Website/Sponsors`
2. Open these folders in your browser and drag-and-drop the relevant image files (e.g. from `/public/images2/...`) directly into them.
3. Once uploaded, right-click on any image, click **Get link**, make sure General Access is set to **Anyone with the link (Viewer)**, and copy the File ID from the link string:
   `https://drive.google.com/file/d/{THIS_IS_THE_FILE_ID}/view?usp=sharing`

### 2. Enter Records in Google Sheets
1. Open your `Samarth Website CMS` Google Sheet.
2. Go to the sheet tab representing the resource type (e.g. **Team**).
3. Paste the values into rows manually. Insert the respective Google Drive File ID copied above under the **imageFileId** (or **logoFileId**) column.
