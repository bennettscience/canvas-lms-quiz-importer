function getBase() {
  return PropertiesService.getDocumentProperties().getProperty("base") + "/api/v1/"
}

function auth() {
  var canvasService = getCanvasService();
  
  var headers = {
    "Authorization": "Bearer " + canvasService.getAccessToken(),
    "Content-Type":"application/json"
  }
  
  Logger.log(headers)
  return headers;
  
}

function get(url, payload) {
  url = getBase() + url
//  url = 'https://elkhart.beta.instructure.com/api/v1/courses'
  
  var options = {
    "method":"get",
    "headers": auth(),
    "payload": payload,
    "muteHttpExceptions":false
  }
  
  var resp = UrlFetchApp.fetch(url, options)

  return resp
  
}

function post(url, payload) {
  url = getBase() + url;
  
  var options = {
    "method":"post",
    "headers": auth(),
    "payload": payload,
    "muteHttpExceptions": true
  }
  
    var response = UrlFetchApp.fetch(url, options)
    var code = response.getResponseCode();
    if(code === 200) {
      return true
    } else {
      var error = response.getContentText()
      error = JSON.parse(error)
      throw new Error(error.errors[0].message)
    }
  
}

function put(url, bankId) {
   
}