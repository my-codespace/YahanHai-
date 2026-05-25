/**
 * Resolves an asset path to a full URL based on the backend API or socket URL.
 * Falls back to localhost in development.
 * 
 * @param {string} path - The relative path of the asset (e.g., "uploads/somefile.png")
 * @returns {string} - The full URL to the asset
 */
export function resolveAssetUrl(path) {
  if (!path) return '';
  
  // If it's already a full URL or data URI, return it as-is
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  // Remove leading slash if any
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Base URL fallback
  let baseUrl = 'http://localhost:5000';

  if (process.env.REACT_APP_API_URL) {
    // If the API URL ends with '/api', strip it to get the base URL
    baseUrl = process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '');
  } else if (process.env.REACT_APP_SOCKET_URL) {
    baseUrl = process.env.REACT_APP_SOCKET_URL;
  }

  // Strip trailing slash of base URL if present
  baseUrl = baseUrl.replace(/\/+$/, '');

  return `${baseUrl}/${cleanPath}`;
}
