import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";

// Configure R2 Client using Vercel Environment Variables
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

// 🟢 CRITICAL: Disable Vercel's default body parser so we can read the file
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 🟢 Parse the incoming file using formidable
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get the uploaded file
    const file = files.file?.[0] || files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read the file content
    const fileContent = file.filepath ? require('fs').readFileSync(file.filepath) : file.data;
    const fileName = `hotels/${Date.now()}-${file.originalFilename || 'upload.jpg'}`;
    const bucketName = process.env.R2_BUCKET_NAME;

    // 🟢 Upload to Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype || 'image/jpeg',
    });

    await s3.send(command);

    // Construct the public URL
    const publicUrl = `https://pub-520fe91b713446edb95e193ae19ef26f.r2.dev/${fileName}`;

    return res.status(200).json({ url: publicUrl });

  } catch (error) {
    console.error("🔥 Upload error:", error);
    return res.status(500).json({ error: "Upload failed: " + error.message });
  }
}