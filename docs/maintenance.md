# CMS Maintenance & Handover Guide

This guide describes how to manage ownership handovers, perform backups, and troubleshoot issues for the Samarth Website CMS.

---

## 1. Google Account Ownership & Handover

Because Google Sheets and Google Drive act as the primary database and asset storage, ownership must reside under a shared club Google account rather than any individual student's personal account.

### Transferring Ownership to New Leadership
When club leadership changes (e.g. at the start of a new academic year):
1. **Google Drive Ownership**:
   - Open Google Drive and locate the `Samarth Website` root folder.
   - Click **Share**.
   - Add the new leader's/official club email as an **Editor**.
   - Once added, open the share settings again, click the dropdown next to their name, and select **Transfer ownership**.
   - The new owner must accept the transfer invitation.
2. **Google Spreadsheet Ownership**:
   - Repeat the same steps for the `Samarth Website CMS` Spreadsheet.
3. **Apps Script Project Handover**:
   - Open the Apps Script editor project.
   - Click the **Share** button in the top right.
   - Add the new leader's email as an editor.
   - They can then create a new deployment of the web app under their account (which generates a new Web App URL).
   - If they redeploy, remember to update the Web App URL inside the Admin Panel settings and the Public Client `.env` files.

---

## 2. Backup Strategy

### Google Sheets Version History
Google Sheets automatically saves a history of changes. If data is accidentally deleted:
1. Open the `Samarth Website CMS` Spreadsheet.
2. Go to **File** -> **Version history** -> **See version history**.
3. Select a previous timestamp to restore or copy historical data from.

### Automated Backups (Periodic Exports)
To make manual backups:
1. Open the Spreadsheet.
2. Click **File** -> **Download** -> **Microsoft Excel (.xlsx)** or **PDF**.
3. Keep backups of important images inside a local archive folder on a shared club hard drive or secondary backup drive.

---

## 3. Adding and Managing Administrators

1. Sign in to the Admin Dashboard using a `SUPER_ADMIN` account.
2. Go to the **Manage Admins** page.
3. Click **Register Admin** and enter:
   - Google Email address.
   - Name.
   - Access Role (`SUPER_ADMIN`, `ADMIN`, `EDITOR`).
   - Active status.
4. Click **Save**. The user can now immediately sign in with their Google Account.

---

## 4. Creating a New Academic Year

At the start of a new term:
1. Log in to the Admin Dashboard.
2. Navigate to the **Academic Years** page.
3. Click **New Academic Year**.
4. Enter the year code (e.g., `2027-28`) and a label.
5. Check **Mark as Current Academic Year** if you want new content to default to this year.
6. Click **Save**.
   - The public website filters and pages will now automatically default to showing the team, events, and guests of this year.
   - Historical records of previous years remain intact and searchable.
