import { ThirdwebStorage } from "@thirdweb-dev/storage";

export async function uploadFileToThirdWeb(file, maxFileSize) {
  // Validate file type
  const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!validImageTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload an image file (JPEG, PNG, GIF).",
    );
  }

  // Validate file size
  if (file.size > maxFileSize) {
    const maxSizeMb = maxFileSize / 1024 / 1024;
    throw new Error(`File is too large (max size is ${maxSizeMb} MB)`);
  }

  const config = useRuntimeConfig();
  const storage = new ThirdwebStorage({
    clientId: config.thirdwebClientId,
  });

  const fileUri = await storage.upload(file);

  return fileUri;
}
