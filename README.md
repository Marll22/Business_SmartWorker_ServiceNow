# Business_SmartWorker_MicroApp_ServiceNow
POC of ServiceNow integration. Scripted REST API on ServiceNow dev instance.

## Creating a developer instance

```
https://developer.servicenow.com/app.do#!/prog
```

Creating a ServiceNow integration can be broken down into three steps:

__1. Create Outbound REST Message (OPTIONAL - the outbound REST Message can also created within the Scripted REST API)__
  1. Create new REST Message under System Web Services -> Outbound -> REST Message.
  2. Set endpoint to Smart Ansatts validate endpoint (example: https://smartworker-dev-azure-idp.pimdemo.no/idp/url).
  3. Create new HTTP method. This should be a GET. (In this example we have named the REST Message 'validateWithAtWork' and the HTTP method 'GET', which will be used in the Scripted REST API).

__2. Create Scripted REST API__
  1. Create new Scripted Rest API under System Web Services -> Scripted Web Services -> Scripted REST APIs
  2. Create new Resource (each file in this repo is a resource)
    1. Set HTTP method (GET for all the resources except post_incidents(POST))
    2. Implement the resource (I would recommend starting with the knowledge base for learning purposes). If you did not follow step 1, you have to set the endpoint, headers and requestbody in code when validating with Smart Ansatt (see RestMessageV2 in ServiceNow documentation).

__3. Create CORS rule__
  1. Create new CORS Rule under System Web Services -> REST -> CORS Rules
  2. Choose the Scripted REST API you created in step 2.
  3. Set the domain to Smart Ansatt URL or a '*' as a wildcard (example: *.pimdemo.no).
  4. Set the exposed header to 'Access-Control-Allow-Origin'.