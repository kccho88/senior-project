import AWS from 'aws-sdk';

// AWS S3 설정
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-northeast-2',
});

/**
 * S3에 파일 업로드
 * @param {Buffer} fileBuffer - 파일 버퍼
 * @param {string} fileName - 파일명
 * @param {string} mimeType - MIME 타입
 * @returns {Promise<string>} - 업로드된 파일 URL
 */
export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read',
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 업로드 실패:', error);
    throw error;
  }
};

/**
 * S3에서 파일 삭제
 * @param {string} fileUrl - 삭제할 파일 URL
 */
export const deleteFromS3 = async (fileUrl) => {
  const key = fileUrl.split('.com/')[1];
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 삭제 실패:', error);
    throw error;
  }
};

export default s3;


