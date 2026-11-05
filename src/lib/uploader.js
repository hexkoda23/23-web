export async function uploadFileCloudinary(file, userId = "anonymous") {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("cloudinary-not-configured");
  }
  const resourceType = "auto";
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  form.append("folder", `digitalProfiles/${userId}`);
  try {
    const res = await fetch(url, { method: "POST", body: form });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`cloudinary-upload-failed: ${text}`);
    }
    const data = await res.json();
    return {
      // Only Safari can show HEIC, so ask Cloudinary for a JPG copy that every browser can display.
      url: data.secure_url.replace(/\.hei[cf]$/i, '.jpg'),
      publicId: data.public_id,
      bytes: data.bytes,
      format: data.format,
      resourceType: data.resource_type,
    };
  } catch (e) {
    throw e;
  }
}
