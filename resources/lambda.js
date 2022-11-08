const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

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
                await dynamo
                    .put({
                        TableName: process.env.TABLE,
                        Item: {
                            id: requestJSON.id,
                            full: requestJSON.fullUrl,
                            short: requestJSON.shortUrl
                        }
                    })
                    .promise();
                body = `Put item ${requestJSON.id}`;
                break;
            case 'GET':
                body = await dynamo.scan({ TableName: process.env.TABLE }).promise();
                console.log("this works", body);
                break;
            case "GET /{urllink}":
                body = "I want to see if anything changes from this";
                break;
    
            default:
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
    // const response = {
    //     statusCode: 200,
        // body: JSON.stringify([
        //     {todoId: 1, text: 'walk the dog 🐕'},
        //     {todoId: 2, text: 'cook dinner 🥗'},
        //   ]),
    // };
    // return response; 

    return {statusCode, body, headers}
}