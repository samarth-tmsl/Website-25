# Google Sheets Database Architecture

This document describes the structure and schemas of the master Google Spreadsheet `Samarth Website CMS` which acts as the database for the website.

---

## Spreadsheet Tabs and Schemas

### 1. Settings
Stores system settings, toggle states, and configuration variables.

| Column | Type | Description |
| :--- | :--- | :--- |
| **key** | String | Setting identifier (e.g. `site_name`, `maintenance_mode`) |
| **value** | String | Current configuration value |
| **description** | String | Description of what this setting configures |
| **updatedAt** | Date | ISO Timestamp of last modification |
| **updatedBy** | String | Email of the administrator who updated this setting |

---

### 2. Admins
Registered users permitted to access the administrative dashboard panel.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`ADM_XXXXXX`) |
| **email** | String | Registered administrator Google Email (must be active to login) |
| **name** | String | Display name of the admin user |
| **role** | Enum | Access level scope: `SUPER_ADMIN`, `ADMIN`, `EDITOR` |
| **active** | Boolean | Set to `TRUE` if access is allowed, `FALSE` to disable |
| **createdAt** | Date | ISO Creation timestamp |
| **updatedAt** | Date | ISO Last modification timestamp |

---

### 3. AcademicYears
Academic years used to categorize student committees and guest records historically.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`AY_XXXXXX`) |
| **year** | String | Standard year format (e.g. `2026-27`) |
| **label** | String | User friendly label |
| **active** | Boolean | Allowed to be selected / filtered |
| **isCurrent** | Boolean | Set to `TRUE` to make this the active year by default |
| **createdAt** | Date | ISO Creation timestamp |
| **updatedAt** | Date | ISO Last modification timestamp |

---

### 4. Team
Active and inactive student committees, advisors, and contributors.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`TEAM_XXXXXX`) |
| **academicYear** | String | Associated year key (e.g. `2026-27`) |
| **wing** | String | Wing categorizations (e.g. `Committee`, `Pravidhi`, `Web Development`) |
| **name** | String | Full name |
| **position** | String | Role name (e.g. `President`, `Head`, `Co-Head`, `Member`) |
| **bio** | String | Short profile biography |
| **imageFileId** | String | Google Drive File ID representing the profile photo |
| **linkedin** | String | Profile URL link |
| **github** | String | Profile URL link |
| **instagram** | String | Profile URL link |
| **email** | String | Contact email address |
| **displayOrder** | Number | Sort ordering priority (lower numbers appear first) |
| **active** | Boolean | Visible on public site |
| **createdAt** | Date | ISO Creation timestamp |
| **updatedAt** | Date | ISO Last modification timestamp |
| **updatedBy** | String | Email of editor |

---

### 5. Guests
Guest speakers, seminar lecturers, and panel invitees.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`GUEST_XXXXXX`) |
| **academicYear** | String | Associated academic year |
| **eventId** | String | ID of event they are associated with (optional) |
| **name** | String | Full name |
| **designation** | String | Professional designation |
| **organization** | String | Professional organization |
| **description** | String | Biography / outline details |
| **imageFileId** | String | Google Drive File ID for guest photo |
| **displayOrder** | Number | Sort ordering weight |
| **active** | Boolean | Visbility status |
| **createdAt** | Date | ISO Creation timestamp |
| **updatedAt** | Date | ISO Last modification timestamp |
| **updatedBy** | String | Email of editor |

---

### 6. GalleryAlbums
Event photo albums.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`ALBUM_XXXXXX`) |
| **academicYear** | String | Associated academic year |
| **title** | String | Album name |
| **description** | String | Album details |
| **eventId** | String | Associated event ID (optional) |
| **coverImageId** | String | Google Drive File ID of cover image |
| **displayOrder** | Number | Sort ordering weight |
| **active** | Boolean | Visbility status |
| **createdAt** | Date | ISO Creation timestamp |
| **updatedAt** | Date | ISO Last modification timestamp |
| **updatedBy** | String | Email of editor |

---

### 7. GalleryImages
Individual photos residing inside Gallery albums.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`IMG_XXXXXX`) |
| **albumId** | String | ID of album this image resides in |
| **fileId** | String | Google Drive File ID of the photo |
| **fileName** | String | Original name of uploaded image file |
| **caption** | String | Display caption text |
| **displayOrder** | Number | Sort ordering weight |
| **active** | Boolean | Visibility status |
| **uploadedAt** | Date | ISO Creation timestamp |
| **uploadedBy** | String | Email of editor |

---

### 8. Events
Scheduled cultural and technical events.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`EVENT_XXXXXX`) |
| **academicYear** | String | Associated year |
| **title** | String | Event name |
| **slug** | String | Unique clean URL slug |
| **description** | String | Event details |
| **date** | Date | Event date |
| **startTime** | String | Formatted start time |
| **endTime** | String | Formatted end time |
| **venue** | String | Campus venue |
| **posterFileId** | String | Google Drive File ID of poster |
| **registrationUrl** | String | Registration portal link |
| **status** | Enum | Status: `DRAFT`, `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED` |
| **displayOrder** | Number | Sort ordering weight |
| **active** | Boolean | Visibility status |
| **createdAt** | Date | ISO Creation timestamp |
| **updatedAt** | Date | ISO Last modification timestamp |
| **updatedBy** | String | Email of editor |

---

### 9. Announcements
Notification banners shown dynamically on the homepage.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`ANN_XXXXXX`) |
| **title** | String | Title |
| **content** | String | Detailed announcement content |
| **link** | String | Banner link redirection target |
| **priority** | Number | Sort priority |
| **startDate** | Date | Visible starting date |
| **endDate** | Date | Visible ending date |
| **active** | Boolean | Visibility status |
| **createdAt** | Date | ISO Creation timestamp |
| **updatedAt** | Date | ISO Last modification timestamp |
| **updatedBy** | String | Email of editor |

---

### 10. Sponsors
Brand sponsors and partners.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`SPONSOR_XXXXXX`) |
| **academicYear** | String | Associated year |
| **name** | String | Brand name |
| **logoFileId** | String | Google Drive File ID of logo |
| **website** | String | Brand redirection URL |
| **description** | String | Brand details |
| **tier** | String | Tier category (e.g. `Gold`, `Platinum`) |
| **displayOrder** | Number | Sort ordering weight |
| **active** | Boolean | Visibility status |
| **createdAt** | Date | ISO Creation timestamp |
| **updatedAt** | Date | ISO Last modification timestamp |
| **updatedBy** | String | Email of editor |

---

### 11. AuditLogs
administrative actions log tracker.

| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | String | Unique ID (`LOG_XXXXXX`) |
| **timestamp** | Date | Action ISO Timestamp |
| **adminEmail** | String | Administrator email performing mutation |
| **action** | String | Type of operation (e.g. `CREATE_TEAM_MEMBER`) |
| **entity** | String | Affected sheet entity name |
| **entityId** | String | ID of affected entity |
| **details** | String | Text logs of action |
