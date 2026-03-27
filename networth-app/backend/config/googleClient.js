import { google } from 'googleapis';

function createAuthClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const scopes =
    process.env.GOOGLE_SHEETS_SCOPES ||
    'https://www.googleapis.com/auth/spreadsheets.readonly';

  if (!clientEmail || !privateKey) {
    console.warn(
      'Google Sheets credentials are not fully configured. Import endpoint will not work until they are set.'
    );
    return null;
  }

  return new google.auth.JWT(clientEmail, undefined, privateKey, scopes);
}

export function getSheetsClient() {
  const auth = createAuthClient();
  if (!auth) return null;
  return google.sheets({ version: 'v4', auth });
}

