const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require('aws-cdk-lib/aws-apigateway');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');

class ServerlessUrlShortenerStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'short', type: dynamodb.AttributeType.STRING }, 
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,  
    })

    const handler = new lambda.Function(this, "Handler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "lambda.handler", 
      environment: {
        TABLE: table.tableName,
      },
    });

    table.grantFullAccess(handler);

    const api = new apigateway.RestApi(this, 'api', {
      description: 'url shortener gateway',
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    })
    new CfnOutput(this, 'apiUrl', {value: api.url});


    const urlshortener = api.root.addResource('urlshortener');
    urlshortener.addMethod(
      'POST',
      new apigateway.LambdaIntegration(handler, {proxy: true}),
    );
    // Used for testing
    // urlshortener.addMethod(
    //   'PUT',
    //   new apigateway.LambdaIntegration(handler, {proxy: true}),
    // );

    // adding urlshortener/{url}
    const shortUrl = urlshortener.addResource('{shorturl}');
    shortUrl.addMethod(
      'GET',
      new apigateway.LambdaIntegration(handler)
    )
  }
}

module.exports = { ServerlessUrlShortenerStack }
