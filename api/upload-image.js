import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";

// Configure R2 Client
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

export const config = {
  api: {
    bodyParser: false, // Vercel requires this to handle formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileContent = fs.readFileSync(file.filepath);
    const fileName = `hotels/${Date.now()}-${file.originalFilename}`;
    const bucketName = process.env.R2_BUCKET_NAME;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    // Construct the public URL
    const publicUrl = `https://pub-520fe91b713446edb95e193ae19ef26f.r2.dev/${fileName}`;

    return res.status(200).json({ url: publicUrl });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}