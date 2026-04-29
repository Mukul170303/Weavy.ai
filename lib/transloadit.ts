export async function uploadToTransloadit(file: File | Blob | Buffer, fileName: string = "file"): Promise<string> {
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
        // Handle Buffer (Node.js environment)
        const blob = new Blob([file as any]);
        formData.append("file", blob, fileName);
    }

    try {
        const response = await fetch("https://api2.transloadit.com/assemblies", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.message || "Upload failed");
        }

        // Return the first available SSL result from the raw uploads
        // This is much more reliable than waiting for steps for a simple host.
        const directUrl = data.uploads?.[0]?.ssl_url;
        if (directUrl) return directUrl;

        // Fallback to results if available
        return data.results?.["imported"]?.[0]?.ssl_url || data.assembly_ssl_url;

    } catch (err) {
        console.error("Transloadit Service Error:", err);
        throw err;
    }
}
