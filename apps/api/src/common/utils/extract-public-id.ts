export function extractCloudinaryPublicId(url: string): string | null {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    const path = parts[1];

    // bỏ version (v12345/)
    const withoutVersion = path.replace(/^v\d+\//, '');

    // bỏ extension (.jpg, .png)
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch {
    return null;
  }
}
