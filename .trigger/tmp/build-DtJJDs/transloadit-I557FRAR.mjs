import {
  __name,
  init_esm
} from "./chunk-H4SOERNS.mjs";

// lib/transloadit.ts
init_esm();
async function uploadToTransloadit(file, fileName = "file") {
  const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY;
  if (!authKey || authKey === "your-transloadit-key") {
    throw new Error("Transloadit AUTH_KEY is missing. Please add NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY to your .env file.");
  }
  const payload = {
    auth: { key: authKey },
    wait: true,
    steps: {
      "imported": {
        robot: "/file/serve"
      }
    }
  };
  const formData = new FormData();
  formData.append("params", JSON.stringify(payload));
  if (file instanceof Blob) {
    formData.append("file", file, fileName);
  } else {
    const blob = new Blob([file]);
    formData.append("file", blob, fileName);
  }
  try {
    const response = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.message || "Upload failed");
    }
    const directUrl = data.uploads?.[0]?.ssl_url;
    if (directUrl) return directUrl;
    return data.results?.["imported"]?.[0]?.ssl_url || data.assembly_ssl_url;
  } catch (err) {
    console.error("Transloadit Service Error:", err);
    throw err;
  }
}
__name(uploadToTransloadit, "uploadToTransloadit");
export {
  uploadToTransloadit
};
//# sourceMappingURL=transloadit-I557FRAR.mjs.map
