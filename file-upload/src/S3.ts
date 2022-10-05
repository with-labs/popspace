import Aws from 'aws-sdk';
import { MetadataFile } from './FileManager';
import { Storage } from './Storage';

const CORS_ORIGINS = (process.env.S3_CORS_ORIGINS || '').split(',');

export interface S3Options {
  s3Sdk?: Aws.S3;
  bucketName: string;
  publicBucket?: boolean;
  corsOrigins?: string[];
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export class S3Storage implements Storage {
  private bucketName: string;
  private publicBucket: boolean;
  private corsOrigins: string[];
  private s3: Aws.S3;

  constructor(options: S3Options) {
    this.bucketName = options.bucketName;
    this.publicBucket = options.publicBucket || false;
    this.corsOrigins = options.corsOrigins || CORS_ORIGINS;
    this.s3 =
      options.s3Sdk ||
      new Aws.S3({
        accessKeyId: options.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:
          options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
        region: options.region || process.env.AWS_REGION,
      });
  }

  initialize = async () => {
    // upsert the bucket
    try {
      await this.s3
        .headBucket({
          Bucket: this.bucketName,
        })
        .promise();
    } catch (error: any) {
      if (
        error.message === 'The specified bucket does not exist' ||
        error.statusCode === 404
      ) {
        await this.s3
          .createBucket({
            Bucket: this.bucketName,
          })
          .promise();
      } else {
        throw error;
      }
    }
    // configure the bucket with CORS
    await this.s3
      .putBucketCors({
        Bucket: this.bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['Authorization'],
              AllowedMethods: ['GET', 'HEAD'],
              AllowedOrigins: this.corsOrigins,
              ExposeHeaders: [],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      })
      .promise();
  };

  storeFileBuffer = (key: string, data: Buffer, mimetype: string) => {
    return this.s3
      .upload({
        Key: key,
        Body: data,
        Bucket: this.bucketName,
        ACL: this.publicBucket ? 'public-read' : undefined,
        ContentType: mimetype,
      })
      .promise()
      .then((r) => r.Location);
  };

  deleteFile = (fileUrl: string) => {
    const parsed = new URL(fileUrl);
    // S3 keys don't have starting slash
    const key = parsed.pathname.slice(1);
    const objectParams = {
      Bucket: this.bucketName,
      Key: key,
    };
    console.debug(`Deleting ${key}`);
    return this.s3.deleteObject(objectParams).promise();
  };
}
