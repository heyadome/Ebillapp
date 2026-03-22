import { google } from "googleapis";
import { Readable } from "stream";

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

/**
 * Upload a file to Google Drive
 */
export async function uploadToGoogleDrive(options: {
  fileName: string;
  mimeType: string;
  fileBuffer: Buffer;
  folderId?: string;
}): Promise<{ fileId: string; webViewLink: string } | null> {
  const auth = getOAuth2Client();
  if (!auth) {
    console.warn("Google Drive not configured — skipping backup");
    return null;
  }

  const drive = google.drive({ version: "v3", auth });

  const folderId = options.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Ensure monthly subfolder exists
  const now = new Date();
  const monthFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthFolderId = await getOrCreateFolder(drive, monthFolder, folderId || undefined);

  const stream = new Readable();
  stream.push(options.fileBuffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: options.fileName,
      parents: monthFolderId ? [monthFolderId] : folderId ? [folderId] : undefined,
    },
    media: {
      mimeType: options.mimeType,
      body: stream,
    },
    fields: "id, webViewLink",
  });

  return {
    fileId: response.data.id || "",
    webViewLink: response.data.webViewLink || "",
  };
}

/**
 * Get or create a folder in Google Drive
 */
async function getOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  folderName: string,
  parentId?: string
): Promise<string | null> {
  try {
    // Search for existing folder
    const query = parentId
      ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
      : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const res = await drive.files.list({ q: query, fields: "files(id)" });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id || null;
    }

    // Create folder
    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
      },
      fields: "id",
    });

    return folder.data.id || null;
  } catch (error) {
    console.error("Error creating Drive folder:", error);
    return parentId || null;
  }
}

/**
 * Check if Google Drive is configured
 */
export function isGoogleDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
}
