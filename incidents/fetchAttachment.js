(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

  response.setContentType('image/jpeg');
  response.setStatus(200);
  var writer = response.getStreamWriter();

  try{
    var queryParams = request.queryParams;
    var sysId = queryParams.sysid;
    writer.writeStream(fetchAttachments(sysId));
  }
  catch(error){
    gs.info(error.message);
  }

})(request, response);

function fetchAttachments(sysId) {
  /* find attachment */
  var sa = new GlideRecord('sys_attachment');
  sa.addQuery('table_name','incident');
  sa.addQuery('table_sys_id',sysId);
  sa.query();
  //Only returning first attachment
  while (sa.next()) {
    var attachmentIS = new GlideSysAttachmentInputStream(sa.sys_id);
    return attachmentIS;
  }
}