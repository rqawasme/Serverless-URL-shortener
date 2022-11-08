const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
// const shortId = require('shortid');
import * as shortId from "/opt/nodejs/shortid-utils";

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
      "Content-Type": "application/json"
    };

    console.log("did it work?", event, context);
    const httpMethod = event.httpMethod;
    const path = event.path;

    try {
        switch (httpMethod) {
            case 'POST':
                let requestJSON = JSON.parse(event.body);
                console.log(requestJSON)
                const shorturl = shortId.generate()
                await dynamo
                    .put({
                        TableName: process.env.TABLE,
                        Item: {
                            short: shorturl,
                            full: requestJSON.fullUrl,
                        }
                    })
                    .promise();
                console.log(shorturl);
                body = `Put item ${requestJSON.fullUrl} as ${shorturl}`;
                break;
            case 'PUT':
                body = await dynamo.scan({ TableName: process.env.TABLE }).promise();
                console.log("this works", body);
                break;
            case 'GET':
                try {
                    const url = await dynamo.getItem({ TableName: process.env.TABLE, Key: {"short": {S: event.pathParameters.shorturl}} }).promise();
                    console.log(url)
                    statusCode = 302;
                    body = url;
                    location.href = url;
                } catch (error) {
                    console.log("ERROR WITH GETTING ITEM");
                    statusCode = 404;
                    body = "Url not found. Could not redirect.";
                }
                break;
            default:
                console.log("SKIP ALL");
                break;
        }         
    } catch (error) {
        return {
            statusCode: 500,
            headers: {},
            body: JSON.stringify("Something Went wrong")
        }
    } finally {
        body = JSON.stringify(body);
    }

    return {statusCode, body, headers}
}