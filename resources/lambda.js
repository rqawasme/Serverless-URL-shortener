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

    console.log("did it work?", event, context);
    const httpMethod = event.httpMethod;

    try {
        switch (httpMethod) {
            case 'POST':
                let requestJSON = JSON.parse(event.body);
                console.log(requestJSON)
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
                console.log(shorturl);
                body = `Put item ${requestJSON.full} as ${shorturl}`;
                break;
            case 'PUT':
                body = await dynamo.scan({ TableName: process.env.TABLE }).promise();
                console.log("this works", body);
                break;
            case 'GET':
                try {
                    const obj = await dynamo.get({ TableName: process.env.TABLE, Key: {"short": event.pathParameters.shorturl} }).promise();
                    const url = obj["Item"]["full"];
                    console.log(url)
                    statusCode = 302;
                    body = url;
                    headers = {"location": url};
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