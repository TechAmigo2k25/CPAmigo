// lib/utils.ts or a separate helper file
export const getSafePdfUrl = (url: string) => {
  if (!url) return "";
  // Convert GitHub Raw to jsDelivr to bypass 'Content-Disposition: attachment'
  if (url.includes("raw.githubusercontent.com")) {
    return url
      .replace("raw.githubusercontent.com", "cdn.jsdelivr.net/gh")
      .replace("/main/", "@main/");
  }
  return url;
};