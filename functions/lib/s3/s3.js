//TODO delete

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
    const finalPath = this.getFilePath(fileName, filePath)
    return `https://s3.${process.env.WITH_S3_REGION}.amazonaws.com/${bucketName}/${finalPath}`
  }

  /**
   * @param {string} fileURL - the full file URL. Must be an S3 URL (s3.region.amazonaws.com/...)
   */
  deleteFile(fileUrl) {
    const parsed = new URL(fileUrl)
    const pathTokens = parsed.pathname.split("/").map(decodeURIComponent)
    // first item is always "" (because of the leading slash)
    pathTokens.shift()
    const bucketName = pathTokens.shift()
    const filePath = pathTokens.join("/")
    const objectParams = {
      Bucket: bucketName,
      Key: filePath
    }
    return this.s3.deleteObject(objectParams).promise()
  }

  getFilePath(fileName, filePath) {
    return filePath ? `${filePath}/${fileName}` : fileName
  }
}

module.exports = new S3()
