const Aws = require("aws-sdk")

class S3 {
  async init() {
    this.s3 = new Aws.S3({
      accessKeyId: process.env.AWS_APP_ACCESS_KEY,
      secretAccessKey: process.env.AWS_APP_SECRET_KEY,
      region: process.env.WITH_S3_REGION
    })
  }

  async cleanup() {}

  getUploadUrl(fileName, bucketName, filePath) {
    const finalPath = filePath ? `${filePath}/${fileName}` : fileName
    const s3Params = {
      Bucket: bucketName,
      Key: finalPath
    }

    return this.s3.getSignedUrl("putObject", s3Params)
  }

  getDownloadUrl(fileName, bucketName, filePath) {
    const finalPath = filePath ? `${filePath}/${fileName}` : fileName
    return `https://s3.${process.env.WITH_S3_REGION}.amazonaws.com/${bucketName}/${finalPath}`
  }
}

module.exports = new S3()
