function storeApiKeys(form) {
  PropertiesService.getDocumentProperties().setProperties(form)
  
  SpreadsheetApp.getUi().createAddonMenu().addItem("Login", "login").addToUi();
  
  return "Success. You may close this window and use the Addon Menu to log into Canvas."
}

function setup() {
  return SpreadsheetApp.getUi().showModalDialog(HtmlService.createTemplateFromFile("setup").evaluate(), "Connect to Canvas")
}

function login() {
  return SpreadsheetApp.getUi().showSidebar(HtmlService.createTemplateFromFile("auth").evaluate().setWidth(500).setTitle("Canvas Quiz Uploader"));
}

function clearBaseUrl() {
  PropertiesService.getDocumentProperties().deleteProperty("base");
  return "Login address successfully cleared."
}

function setBaseUrl(url) {
  Logger.log(url);
  PropertiesService.getDocumentProperties().setProperty("base", url)
  
  var canvasService = getCanvasService();
  return canvasService.getAuthorizationUrl();
}

function getBaseUrl() {
  return PropertiesService.getDocumentProperties().getProperty("base");
}

function getAuthorizationUrl() {
  var canvasService = getCanvasService();
  var authorizationUrl = canvasService.getAuthorizationUrl()
  return authorizationUrl
}

function getCanvasService() {
  return OAuth2.createService("canvas")
  
  .setAuthorizationBaseUrl(PropertiesService.getDocumentProperties().getProperty("base") + '/login/oauth2/auth?')
  .setTokenUrl(PropertiesService.getDocumentProperties().getProperty("base") + "/login/oauth2/token")
  
  .setClientId(PropertiesService.getDocumentProperties().getProperty('id'))
  .setClientSecret(PropertiesService.getDocumentProperties().getProperty('key'))
  
  .setCallbackFunction('authCallback')
  
  .setPropertyStore(PropertiesService.getUserProperties())
}

function authCallback(request) {
  
  var canvasService = getCanvasService();
  
  var isAuthorized = canvasService.handleCallback(request);
  if(isAuthorized) {
    var ui = SpreadsheetApp.getUi();
    ui.createAddonMenu().addItem("Run", "openSidebar").addItem("Logout", "reset").addToUi();
    
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function reset() {
  var canvasService = getCanvasService()
  var options = {
    "method": "delete",
    "headers": {
      "Authorization": "Bearer " + canvasService.getAccessToken(),
      "Content-Type": "application/json"
    }
  }
  UrlFetchApp.fetch(canvasService.tokenUrl_, options)
  canvasService.reset()
  var ui = SpreadsheetApp.getUi();
  ui.createAddonMenu().addItem("Login", "login").addToUi();
}

function clear() {
  PropertiesService.getDocumentProperties().deleteAllProperties()
}