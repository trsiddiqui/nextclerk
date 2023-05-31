import { S3 } from "aws-sdk"
import { createBucket } from "./createBucket"
/**
  * @name checkBucket
  * @param {S3} s3
  * @returns {Promise<{success:boolean; message: string; data:string;}>}
*/
export const checkBucket = async (s3: S3, bucketName:string) => {
  try {
    const res =  await s3.headBucket({Bucket: bucketName}).promise()

    console.log("Bucket already Exist", res.$response)

    return { success: true, message: "Bucket already Exist",data: {}}
  } catch (error) {

    console.log("Error bucket don't exist", error)

    return { success: false, message: "Error bucket don't exist",data: error }
  }
}

export const initBucket = async (s3: S3, bucketName:string) => {
  const bucketStatus = await checkBucket(s3, bucketName)

  if( !bucketStatus.success ) { // check if the bucket don't exist
    let bucket = await createBucket(s3, bucketName); // create new bucket
    console.log(bucket.message);
  }
}
