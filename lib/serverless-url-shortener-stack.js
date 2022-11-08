const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const lambda = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");
const apigateway = require('aws-cdk-lib/aws-apigateway');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const lfn = require('aws-cdk-lib/aws-lambda-nodejs')

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

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'full', type: dynamodb.AttributeType.STRING }, 
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,  
    })

    const shortIdLayer = new lambda.LayerVersion(this, "shortid-layer", {
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X, lambda.Runtime.NODEJS_16_X],
      code: lambda.Code.fromAsset('resources/layers/shortid'),
      description: "Uses a 3rd party library to generate random id",
    })

    new lfn.NodejsFunction(this, "function", {
      runtime: lambda.Runtime.NODEJS_16_X,
      bundling: {
        minify: false,
        externalModules: ['aws-sdk', 'shortid'],
      },
      layers: [shortIdLayer],
    })

    const handler = new lambda.Function(this, "Handler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "lambda.handler", 
      environment: {
        BUCKET: bucket.bucketName,
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
    urlshortener.addMethod(
      'GET',
      new apigateway.LambdaIntegration(handler, {proxy: true}),
    );

    // adding urlshortener/{url}
    const shortUrl = urlshortener.addResource('{shorturl}');
    shortUrl.addMethod(
      'GET',
      new apigateway.LambdaIntegration(handler)
    )

    bucket.grantReadWrite(handler);
  }
}

module.exports = { ServerlessUrlShortenerStack }
