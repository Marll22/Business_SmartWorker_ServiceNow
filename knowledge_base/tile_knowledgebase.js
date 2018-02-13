(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

  try {
    //Possible to set as required header in settings
    if(request.getHeader("authorization") === null) {
      response.setStatus(403);
      response.setBody({});
      return response;
    }
    //Get the base URL. If this relative path is not named tile_knowledgebase, change the param
    var baseUrl = request.url.replace("tile_knowledgebase", "");

    //Validate
    var atWorkResponse = authWithAtWork(request.getHeader("authorization"));

    var parsed = new JSONParser();
    var parsedData = parsed.parse(atWorkResponse.getBody());
    var userId = "servicenowUserId";
    var tile = {};

    //When using StreamWriter you have to set content type and status in code
    var writer = response.getStreamWriter();
    response.setContentType('application/json');
    response.setStatus(200);

    if(atWorkResponse.getStatusCode() === 200 && parsedData.success) {
      //userId = parsedData.userId
      tile = createTile(userId, baseUrl);
      writer.writeString(JSON.stringify(tile));
    }
    else {
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

function createTile(userId, baseUrl) {

  var tile = {
    "type": "icon",
    "iconUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEB7KU665gRjLLJ0kGex9jX1uasb4KttsIhPHfNBc43iYr47Ba",
    "footnote": "Knowledge Base",
    "onClick": {
      "type": "micro-app",
      "apiUrl": baseUrl + "microapp_knowledgebase" //Api URL to corresponding Micro App
    }
  };

  return tile;
}
