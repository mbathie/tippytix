import { writeFile } from 'fs/promises';
import { join } from 'path';

const MAGIC_LINK_FILE = join(process.cwd(), '.dev-magic-link.json');

export async function storeDevMagicLink(email, url) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Attempted to store magic link in production - ignoring');
    return;
  }

  const data = {
    email,
    url,
    timestamp: new Date().toISOString(),
  };

  try {
    await writeFile(MAGIC_LINK_FILE, JSON.stringify(data, null, 2));
    console.log('\n🔐 [DEV AUTH] Magic link stored for programmatic access');
    console.log(`   Email: ${email}`);
    console.log(`   File: ${MAGIC_LINK_FILE}\n`);
  } catch (error) {
    console.error('Failed to store magic link:', error);
  }
}

export const MAGIC_LINK_FILE_PATH = MAGIC_LINK_FILE;
