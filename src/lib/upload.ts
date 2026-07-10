import fs from "node:fs/promises";
import path from "node:path";
import { uploadToS3, generateS3Key } from "./s3";

async function uploadLocal(
  folder: string,
  buffer: Buffer,
  filename: string
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(filename) || ".jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadsDir, safeName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${folder}/${safeName}`;
}

export async function uploadProductImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const hasS3 =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET;

  if (hasS3) {
    const key = generateS3Key("products", filename);
    return uploadToS3(buffer, key, contentType);
  }

  return uploadLocal("products", buffer, filename);
}

export async function uploadReceiptImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const hasS3 =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET;

  if (hasS3) {
    const key = generateS3Key("receipts", filename);
    return uploadToS3(buffer, key, contentType);
  }

  return uploadLocal("receipts", buffer, filename);
}

export async function uploadGalleryImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const hasS3 =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET;

  if (hasS3) {
    const key = generateS3Key("gallery", filename);
    return uploadToS3(buffer, key, contentType);
  }

  return uploadLocal("gallery", buffer, filename);
}
