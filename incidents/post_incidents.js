(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  //Already created outbound rest message. Possible to create in code.
  try {
    if(request.getHeader("authorization") === null) {
      response.setStatus(403);
      response.setBody({});
      return response;
    }
    //VALIDATE
    var atWorkResponse = authWithAtWork(request.getHeader("authorization"));
    var parsedAtWorkResponse = new JSONParser();
    var parsedAtWorkData = parsedAtWorkResponse.parse(atWorkResponse.getBody());

    //When using StreamWriter you have to set content type and status in code
    var writer = response.getStreamWriter();
    response.setContentType('application/json');

    if(atWorkResponse.getStatusCode() === 200 && parsedAtWorkData.success) {
      var gr = new GlideRecord('incident');
      gr.initialize();
      gr.short_description = request.body.data.short_description;
      gr.description = request.body.data.description;
      gr.urgency = request.body.data.urgency;
      var sysId  =  gr.insert();
      var images = request.body.data.images;
      if(images){
        uploadPhotos(sysId, images);
      }
      response.setStatus(200);
      writer.writeString(JSON.stringify({"type" : "reload"}));
    }
    else {
      response.setStatus(res.getStatusCode());
      writer.writeString(JSON.stringify(parsedAtWorkData));
    }
  }
  catch(error) {
    gs.info("Error: could not post incident -> " + error.message);
    response.setStatus(500);
  }

})(request, response);

function authWithAtWork(referenceToken) {
  //Already created outbound rest message. Possible to create from scratch in code.
  var r = new sn_ws.RESTMessageV2('validateAtWork', 'GET');
  r.setRequestHeader("Authorization", referenceToken.replace("Bearer ", ""));

  var res = r.execute();
  return res;
}
function uploadPhotos(sysid, images) {

  for(var i = 0; i < images.length; i++) {
    var stringToDecode = JSON.stringify(images[i]).replace("data:image/jpeg;base64,", "");
    var attachment = new Attachment();
    attachment.write('incident',
             sysid,
             i+"test.jpeg",
             '',
             GlideStringUtil.base64DecodeAsBytes(stringToDecode));
  }
}
