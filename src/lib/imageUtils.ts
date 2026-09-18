export function extractGoogleDriveId(url: string | undefined): string | null {
  if (!url) return null;
  
  if (url.includes('googleusercontent.com/d/')) {
    const match = url.match(/googleusercontent\.com\/d\/([^/?&#]+)/);
    if (match && match[1]) return match[1];
  }
  
  if (url.includes('drive.google.com')) {
    const idParam = url.match(/[?&]id=([^&]+)/);
    if (idParam && idParam[1]) return idParam[1];
    
    const pathMatch = url.match(/\/d\/([^/?&#]+)/);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
  }
  
  return null;
}

export function optimizeImageUrl(url: string | undefined): string {
  if (!url) return '';
  const driveId = extractGoogleDriveId(url);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  return url;
}

export function getFallbackImageUrl(url: string | undefined): string {
  if (!url) return '';
  const driveId = extractGoogleDriveId(url);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
  }
  return url;
}

