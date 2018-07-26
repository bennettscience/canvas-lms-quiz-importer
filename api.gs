
/**
 * All API requests are routed through the REST methods below
 */

/**
 * getBase - Get the base URL string stored in PropertiesService
 *
 * @returns String - user-defined base URL appended with the Canvas API endpoint
 */
function getBase() {
  return PropertiesService.getUserProperties().getProperty("base");
}


/**
 * auth - Construct REST authorization header
 *
 * @returns {Obj} headers
 * @property Authorization - "Bearer " + user API key value
 * @property Content-Type - define 'application/json'
 */
function auth() {
  var key = PropertiesService.getUserProperties().getProperty("key");

  var headers = {
    "Authorization": "Bearer " + key,
    "Content-Type":"application/json"
  }

  return headers;
}


/**
 * get - generic GET request to the Canvas API
 *
 * @param  {String} url     endpoint for the request
 * @param  {Obj} payload    data object
 * @returns {resp}          response object
 */
function get(url, payload) {
  url = getBaseUrl() + url

  // build the request object
  var options = {
    "method":"get",
    "headers": auth(),
    "payload": payload,
    "muteHttpExceptions":false
    
  }
  
  Logger.log(options)
  Logger.log(url)

  var resp = UrlFetchApp.fetch(url, options)

  return resp
}


/**
 * post - generic POST request to the Canvas API
 *
 * @param  {String} url     request endpoint
 * @param  {Obj} payload    data to POST to the endpoint
 * @returns {Obj}           response object
 */
function post(url, payload) {
  var url = getBaseUrl() + url;
  
  Logger.log(url);
  Logger.log(payload);

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
