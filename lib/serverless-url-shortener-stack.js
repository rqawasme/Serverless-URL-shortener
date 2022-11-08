const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const lambda = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");
const apigateway = require('aws-cdk-lib/aws-apigateway');

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

    const bucket = new s3.Bucket(this, "Store");

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

    const handler = new lambda.Function(this, "Handler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "lambda.handler", 
      environment: {
        BUCKET: bucket.bucketName
      }
    });

    // 👇 add a /todos resource
    const urlshortener = api.root.addResource('urlshortener');

    // 👇 integrate GET /todos with getTodosLambda
    urlshortener.addMethod(
      'GET',
      new apigateway.LambdaIntegration(handler, {proxy: true}),
    );

    bucket.grantReadWrite(handler);
  }
}

module.exports = { ServerlessUrlShortenerStack }
