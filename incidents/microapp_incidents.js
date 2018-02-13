(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

  try {
    //Possible to set as required header in settings
    if(request.getHeader("authorization") === null) {
      response.setStatus(403);
      response.setBody({});
      return response;
    }
    //Get the base URL. If this relative path is not named microapp_incidents, change the param
    var baseUrl = request.url.replace("microapp_incidents", "");
    //Validation
    var atWorkResponse = authWithAtWork(request.getHeader("authorization"));

    var parsed = new JSONParser();
    var parsedData = parsed.parse(atWorkResponse.getBody());
    var userId = "servicenowUserId";
    var microApp = {};
    //When using StreamWriter you have to set content type and status in code
    var writer = response.getStreamWriter();
    response.setContentType('application/json');
    response.setStatus(200);

    if(atWorkResponse.getStatusCode() === 200 && parsedData.success) {
      //userId = parsedData.userId
      microApp = createMicroApp(userId, baseUrl);
      writer.writeString(JSON.stringify(microApp));
    }
    else {
      response.setStatus(atWorkResponse.getStatusCode());
      writer.writeString(JSON.stringify(parsedData));
    }
  }
  catch(err) {
    response.setStatus(500);
    gs.info(err.message);
  }
})(request, response);

function authWithAtWork(referenceToken) {
  //Already created outbound rest message. Possible to create from scratch in code.
  var r = new sn_ws.RESTMessageV2('validateAtWork', 'GET');
  r.setRequestHeader("Authorization", referenceToken.replace("Bearer ", ""));

  var res = r.execute();
  return res;
}

function createMicroApp(userId, baseUrl) {

  var microApp = {
    "sections": [
      {
        "header": "Last incidents",
        "rows": []
      },
      {
        "header": "Create Incident",
        "rows": [
          {
            "type": "input",
            "title": "Short description",
            "form": {
              "type": "text",
              "inputKey": "short_description",
              "multipleLines": false
            }
          },
          {
            "type": "input",
            "title": "Description",
            "form": {
              "type": "text",
              "inputKey": "description",
              "multipleLines": true
            }
          },
          {
            "type": "input",
            "title": "Urgency",
            "form": {
              "type": "selection",
              "inputKey": "urgency",
              "options": [
                {
                  "id": "1",
                  "label": "High"
                },
                {
                  "id": "2",
                  "label": "Medium"
                },
                {
                  "id": "3",
                  "label": "Low"
                }
              ]
            }
          },
          {
            "type": "input",
            "title": "Upload photo",
            "form": {
              "type": "image",
              "message": "Legg til et eller flere bilder",
              "inputKey": "images",
              "maxAttachments": "5"
            }
          },
          {
            "type": "button",
            "title": "Submit",
            "onClick": {
              "type": "call-api",
              "url": baseUrl + "post_incidents", //API URL to post_incidents.
              "httpMethod": "POST",
              "includeInputKeys": [
                "short_description","description","urgency", "images"
              ],
              "alert": {
                "type": "query",
                "title": "Submit data"
              }
            },
            "requiredInputKeys": ["short_description", "description","urgency"]
          }
        ]
      }
    ],
  };

  var gr = new GlideRecord('incident');
  gr.orderByDesc('sys_created_on');
  gr.setLimit(5);
  gr.query();

  while (gr.next()) {
    microApp.sections[0].rows.push(
      {
        "type": "text",
        "title": gr.short_description + "",
        "subtitle": gr.description+"",
        "onClick" : {
          "type": "image",
          "imageUrl": baseUrl + "fetchAttachment?sysid=" + gr.sys_id //API URL to fetchAttachment
        },
      });
  }
  return microApp;
}
