import fs from "node:fs/promises";
import path from "node:path";
import { uploadToS3, generateS3Key } from "./s3";

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

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(filename) || ".jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadsDir, safeName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/products/${safeName}`;
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

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(filename) || ".jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadsDir, safeName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/receipts/${safeName}`;
}
