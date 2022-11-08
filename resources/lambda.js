const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let body = JSON.stringify([
        {todoId: 1, text: 'walk the dog 🐕'},
        {todoId: 2, text: 'cook dinner 🥗'},
      ]);
    let statusCode = 200;
    const headers = {
      "Content-Type": "application/json"
    };

    console.log("did it work?", event);

    try {
        switch (event.routeKey) {
            case "POST /":
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
            case "GET /":
                body = await dynamo.scan({ TableName: process.env.TABLE }).promise();
                break;
            case "GET /{urllink}":
                
                break;
    
            default:
                break;
        }
        // const response = {
        //     statusCode: 200,
            // body: JSON.stringify([
            //     {todoId: 1, text: 'walk the dog 🐕'},
            //     {todoId: 2, text: 'cook dinner 🥗'},
            //   ]),
        // };
        // return response;            
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