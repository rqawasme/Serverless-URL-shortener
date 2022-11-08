# SERVERLESS-URL-SHORTENER

[![Deploy](https://github.com/rqawasme/Serverless-URL-shortener/actions/workflows/main.yml/badge.svg)](https://github.com/rqawasme/Serverless-URL-shortener/actions/workflows/main.yml)

This project has two HTTP actions, one to register a URL with a short string, and another to resolve that short string and redirect to the original URL.
In `serverless-url-shortener-stack.js` under /lib is where we create the DynamoDB, Our lambda function, and our API gateway. 
In `lambda.js` under resources is where we have our handler function for our lambda function. Here is were we process the API calls.
A Github Action is created so that whenever you push code to Main, the code is deployed to AWS.

## Register URLs (POST)
* You can call the API using postman or curl or any method of your choice
* Use `POST` to the api gateway. Mine looked like `https://blj6a35jt5.execute-api.us-west-2.amazonaws.com/prod/urlshortener/`.  
* Send the Full url in a body as follows: `{"full": "https://github.com/rqawasme"}`
* If successful, you will recieve response looking like `{ "shortlink": "OIOsfNLJ" }` 

## Resloving Short URLs (GET)
* You can call the API using postman or curl or any method of your choice
* Use `GET` to `https://blj6a35jt5.execute-api.us-west-2.amazonaws.com/prod/urlshortener/<THE SHORT URL>`. Make sure to replace `<THE SHORT URL>` with the string you recieve from the POST call.
* If successful, you will be redirected to the original URL.

## Todos
* Utilize AWS Virtual Waiting Room to handle surges in website traffic
* Possibly minimize monthly cloud provider costs by setting custom budgets in AWS or look into utilizing other solutions such as EC2 Spot instances 
* Check that the string sent in POST is an actual URL before creating short link
* Add an authorization check for the POST action before creating the short link. We will check if the user passed correct credentials for admins in the call.

## Deploy Commands
* `cdk synth`            emits the synthesized CloudFormation template
* `cdk deploy`           deploy this stack to your default AWS account/region

