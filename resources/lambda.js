const aws = require('aws-sdk');
const S3 = new aws.S3();

const bucketName = process.env.BUCKET;

exports.handler = async (event) => {
    try {
        console.log("did it work?", event);
        const data = await S3.listObjectsV2({ Bucket: bucketName }).promise();
        console.log(data)
        const response = {
            statusCode: 200,
            body: JSON.stringify('Hello from Lambda!'),
        };
        return response;            
    } catch (error) {
        return {
            statusCode: 500,
            headers: {},
            body: JSON.stringify("Something Went wrong")
        }
    }
}