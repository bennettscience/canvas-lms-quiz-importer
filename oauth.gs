function storeSchoolKeys(form) {
  PropertiesService.getDocumentProperties().setProperties(form)
  
  SpreadsheetApp.getUi().createAddonMenu().addItem("Login", "login").addToUi();
  
  var ss = spreadsheetSetup()
  
  if(ss) {
    return HtmlService.createTemplateFromFile('auth').evaluate().getContent();
  }
}

function storePersonalKey(form) {
  PropertiesService.getDocumentProperties().setProperties(form);
  SpreadsheetApp.getUi().createAddonMenu().addItem("Run", "openSidebar").addItem("Logout", "reset").addToUi();
  return "<p>Your account is now ready to use. Open the Addon menu and click 'Run' to open the upload dialog in a sidebar.</p>"
}

function spreadsheetSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if(ss.getSheetByName("QuizTemplate") == null) {
    var sheet = ss.insertSheet('QuizTemplate')
    
    sheet.getRange(1, 1, 1, 10).setValues([ ['Question Type','Description','Correct Answer','Distractor','Distractor','Distractor','Distractor','Topic','Primary Standard Indicator','Success'] ]);
    sheet.setColumnWidths(1, 2, 300).setFrozenRows(1);
    
    var validationRange = sheet.getRange(2,1,50,1);
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(["multiple_choice_question","true_false_question"], true);
    
    validationRange.setDataValidation(rule);
  }
  
  return true;
}

function setup() {
  return SpreadsheetApp.getUi().showModalDialog(HtmlService.createTemplateFromFile("popup").evaluate(), "Connect to Canvas")
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

  return HtmlService.createTemplateFromFile("login").evaluate().getContent();
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
  var props = getProps();
  if(props.auth == "school") {
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
    ui.createAddonMenu().addItem("Setup", "setup").addToUi();
    
    PropertiesService.getDocumentProperties().deleteAllProperties()
  } else {
    PropertiesService.getDocumentProperties().deleteAllProperties()
    ui.createAddonMenu().addItem("Setup", "setup").addToUi();
  }
}