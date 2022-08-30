require("dotenv").config();
const S3 = require('aws-sdk/clients/s3');
const sharp = require('sharp');

// const bucketName = "aivara-image";
const region = "ap-south-1";
// const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
// const secretAccessKey = process.env.AWS_S3_SECRET_KEY;


const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
    region,
    endpoint: "s3.ap-south-1.amazonaws.com",
    accessKeyId,
    secretAccessKey
})

//upload to array
async function uploadFile(file, folderName) {

    // const compressImage = file.data;
    // image resize in 1600*1200
    const compressImage = await sharp(file.data)
        .resize(800)
        .sharpen()
        .jpeg({ mozjpeg: true })
        .toBuffer();

    const params = {
        Bucket: "aivara-report-image",
        Key: folderName + "/" + file.name, // File name you want to save as in S3
        Body: compressImage
    };

    const data = await s3.upload(params).promise();
    // Uploading files to the bucket
    return data;
}

async function uploadAnalysisRequest(file, folderName) {
    const params = {
        Bucket: "aivara-analysis-request-image",
        Key: folderName + "/" + file.name, // File name you want to save as in S3
        Body: file.data
    };

    const data = await s3.upload(params).promise();
    // Uploading files to the bucket
    return data;
}
async function uploadAiReceivedImage(file, folderName) {
    const params = {
        Bucket: "aivara-ai-received-image",
        Key: folderName + "/" + file.name, // File name you want to save as in S3
        Body: file.data
    };

    const data = await s3.upload(params).promise();
    // Uploading files to the bucket
    return data;
}

exports.uploadFile = uploadFile
exports.uploadAnalysisRequest = uploadAnalysisRequest;
exports.uploadAiReceivedImage = uploadAiReceivedImage;



//