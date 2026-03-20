import { Client } from 'minio';
import { config } from '../config.js';

const client = new Client({
  endPoint: config.minio.endPoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey
});

export async function ensureBucket() {
  const exists = await client.bucketExists(config.minio.bucket);
  if (!exists) {
    await client.makeBucket(config.minio.bucket);
  }
}

export async function getUploadUrl(objectKey, expirySeconds = 600) {
  return client.presignedPutObject(config.minio.bucket, objectKey, expirySeconds);
}

export async function getDownloadUrl(objectKey, expirySeconds = 600) {
  return client.presignedGetObject(config.minio.bucket, objectKey, expirySeconds);
}
