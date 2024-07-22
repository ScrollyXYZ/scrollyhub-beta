// utils/imageUtils.js

export function validateAndConvertUrl(url) {
  if (!url || typeof url !== "string") {
    return ""; // Return a fallback URL or empty string if invalid
  }

  // Convert IPFS URL to HTTP if necessary
  if (url.startsWith("ipfs://")) {
    url = convertIpfsToHttp(url);
  }

  // Regex to check for forbidden substrings and unsafe domains
  const forbiddenPatterns = /(\?|localhost|127\.0\.0\.1)/i;

  // Allow more permissive URL patterns but check for forbidden patterns
  const isValidUrl =
    /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url) && !forbiddenPatterns.test(url);

  return isValidUrl ? url : ""; // Return the validated URL or empty string if not valid
}

export function convertIpfsToHttp(ipfsUrl) {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUrl;
}
