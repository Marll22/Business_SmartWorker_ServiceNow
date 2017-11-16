# Business_SmartWorker_MicroApp_ServiceNow
POC of ServiceNow integration. Scripted REST API on ServiceNow dev instance.

Creating a ServiceNow integration can be broken down into three steps:

__1. Create Outbound REST Message (OPTIONAL - the outbound REST Message can also created within the Scripted REST API)__
  1. Create new REST Message under System Web Services -> Outbound -> REST Message.
  2. Set endpoint to Smart Ansatts validate endpoint (example: https://smartansattapidev.pimdemo.no/partner/validate).
  3. Create new HTTP method. This should be a POST with the following headers:
    1. Name: Accept, Value: application/json
    2. Name: Content-type, Value: application/json
  4. In content put: {  "token" : "${token}" }

__2. Create Scripted REST API__
  1. Create new Scripted Rest API under System Web Services -> Scripted Web Services -> Scripted REST APIs
  2. Create new Resource (each file in this repo is a resource)
    1. Set HTTP method (GET for all the resources except post_incidents(POST))
    2. Implement the resource (I would recommend starting with the knowledge base for learning purposes). If you did not follow step 1, you have to set the endpoint, headers and requestbody in code when validating with Smart Ansatt (see RestMessageV2 in ServiceNow documentation).

__3. Create CORS rule__
  1. Create new CORS Rule under System Web Services -> REST -> CORS Rules
  2. Choose the Scripted REST API you created in step 2.
  3. Set the domain to Smart Ansatt URL (example: https://smartansattdev.pimdemo.no).

