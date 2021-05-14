import Aws from 'aws-sdk';

const CORS_ORIGINS = (process.env.S3_CORS_ORIGINS || '').split(',');

export class S3 {
  private s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  constructor(
    private bucketName: string,
    private publicBucket: boolean = false,
  ) {}

  configureBucket = async () => {
    // upsert the bucket
    try {
      await this.s3
        .headBucket({
          Bucket: this.bucketName,
        })
        .promise();
    } catch (error) {
      if (error.statusCode === 404) {
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
              AllowedOrigins: CORS_ORIGINS,
              ExposeHeaders: [],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      })
      .promise();
  };

  uploadFileBuffer = (key: string, data: Buffer, mimetype: string) => {
    return this.s3
      .upload({
        Key: key,
        Body: data,
        Bucket: this.bucketName,
        ACL: this.publicBucket ? 'public-read' : undefined,
        ContentType: mimetype,
      })
      .promise();
  };

  deleteFile = (fileUrl: string) => {
    const parsed = new URL(fileUrl);
    const objectParams = {
      Bucket: this.bucketName,
      Key: parsed.pathname,
    };
    return this.s3.deleteObject(objectParams).promise();
  };
}
