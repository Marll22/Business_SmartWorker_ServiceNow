(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

  try {
    //Possible to set as required header in settings
    if(request.getHeader("authorization") === null) {
      response.setStatus(403);
      response.setBody({});
      return response;
    }

    //Get the base URL. Change the param to your resource path (to be found on this page)
    var baseUrl = request.url.replace("api/168275/atworkintegration/microapp_knowledgebase", "");

    //Validate
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
      microApp = createMicroApp(userId, baseUrl);
      writer.writeString(JSON.stringify(microApp));
      //userId = parsedData.userId
    }
    else{
      writer.writeString(JSON.stringify(parsedData));
      response.setStatus(atWorkResponse.getStatusCode());
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
    "search": {
      "type": "local",
      "placeholder": "Søk etter artikler"
    },
    "sections": [
      {
        "header": 'ServiceNow KB artikler',
        "searchableParameters" : ["title"],
        "rows": []
      },
    ],
  };

  var table = 'kb_knowledge',
    record_limit = 30,
    gr = new GlideRecord(table);

  gr.setLimit(record_limit);
  gr.query();

  while (gr.next()) {
    microApp.sections[0].rows.push(
      {
        "type": "text",
        "title": gr.short_description + "",
        "text": "Publisert: " + gr.published,
        "onClick": {
          "type": "action-selection",
          "options" : [
            {
              "label": "Open",
              "action": {
                "type" : "open-url",
                "url": baseUrl + "nav_to.do?uri=%2Fkb_view.do%3Fsysparm_article%3D"+gr.number
              }
            }
          ]
        }
      });
  }
  return microApp;
}
