const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const generateRandomString = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for(var i = 0; i < 8; i++){
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    let headers = {
      "Content-Type": "application/json"
    };
    const httpMethod = event.httpMethod;

    try {
        switch (httpMethod) {
            case 'POST':
                // TODO: Make sure the url sent is an actual url
                // TODO: Require authorization to be able to create short urls
                let requestJSON = JSON.parse(event.body);
                const shorturl = generateRandomString();
                await dynamo
                    .put({
                        TableName: process.env.TABLE,
                        Item: {
                            "short": shorturl,
                            "full": requestJSON.full,
                        }
                    })
                    .promise();
                body = {"shortlink": shorturl};
                break;
            // Was used for testing
            // case 'PUT':
            //     body = await dynamo.scan({ TableName: process.env.TABLE }).promise();
            //     break;
            case 'GET':
                try {
                    const obj = await dynamo.get({ TableName: process.env.TABLE, Key: {"short": event.pathParameters.shorturl} }).promise();
                    const url = obj["Item"]["full"];
                    statusCode = 302;
                    body = url;
                    headers = {"location": url};
                } catch (error) {
                    statusCode = 404;
                    body = "Url not found. Could not redirect.";
                }
                break;
            default:
                throw Error("Invalid Call.");
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