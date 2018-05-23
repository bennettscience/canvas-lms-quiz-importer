
/**
 * All OAuth2 data
 * Relies on the Google OAuth2 Library
 * https://github.com/gsuitedevs/apps-script-oauth2
 */


/**
 * setup - Display the setup dialog to the user
 *
 * @returns {Obj}  User interface object
 */
function setup() {
  return SpreadsheetApp.getUi().showModalDialog(HtmlService.createTemplateFromFile("popup").evaluate().setHeight(500).setWidth(700), "Connect to Canvas")
}

/**
 * login - Display the login screen to authorize via OAuth2
 *
 * @returns {Obj}  User interface object
 */
function login() {
  return SpreadsheetApp.getUi().showSidebar(HtmlService.createTemplateFromFile("auth").evaluate().setWidth(500).setTitle("Canvas Quiz Uploader"));
}

/**
 * clearBaseUrl - Removes the current stored Canvas instance
 *
 * @returns {String}  Success message to update the UI
 */
function clearBaseUrl() {
  PropertiesService.getDocumentProperties().deleteProperty("base");
  return "Login address successfully cleared."
}

/**
 * setBaseUrl - Store the user-defined Canvas URL
 *
 * @param  {String} url   Canvas URL used to log into the user's account
 * @returns {String}      HTML formatted content to update the UI
 */
function setBaseUrl(url) {
  PropertiesService.getDocumentProperties().setProperty("base", url)
  return HtmlService.createTemplateFromFile("login").evaluate().getContent();
}

/**
 * getBaseUrl - Find the stored base URL
 *
 * @returns {String}  User-defined Canvas URL
 */
function getBaseUrl() {
  return PropertiesService.getDocumentProperties().getProperty("base");
}

 /**
  * storeSchoolKeys - Process the user-input Canvas App Key and ID
  *
  * @param  {Obj} form  Submitted by the user via UI. Only used in OAuth2 Login
  * @param form.id      Developer ID from the Canvas Admin console
  * @param form.key     Developer key from the Canvas Admin console
  * @returns {String}   HTML formatted content for updating the UI
  */
function storeSchoolKeys(form) {
  PropertiesService.getDocumentProperties().setProperties(form)

  SpreadsheetApp.getUi().createAddonMenu().addItem("Login", "login").addToUi();

  var ss = spreadsheetSetup()

  if(ss) {
    return HtmlService.createTemplateFromFile('auth').evaluate().getContent();
  }
}

/**
 * storePersonalKey - Save a user-created API key for individual access
 *
 * @param  {Obj} form   Submitted by the user via UI. Only used for personal login
 * @param form.key      Personal API key defined in the User settings
 * @returns {String}    HTML formatted string
 */
function storePersonalKey(form) {
  PropertiesService.getDocumentProperties().setProperties(form);
  SpreadsheetApp.getUi().createAddonMenu().addItem("Run", "openSidebar").addItem("Logout", "reset").addSeparator().addItem("Help", "showHelp").addToUi();
  return "<p>Your account is now ready to use. Open the Addon menu and click 'Run' to open the upload dialog in a sidebar.</p>"
}

/**
 * getAuthorizationUrl - Construct the OAuth2 login url
 *
 * @returns {String}
 */
function getAuthorizationUrl() {
  var canvasService = getCanvasService();
  var authorizationUrl = canvasService.getAuthorizationUrl()
  return authorizationUrl
}

/**
 * getCanvasService - Instantiate Canvas access via OAuth
 *
 * @returns {Obj}
 */
function getCanvasService() {
  return OAuth2.createService("canvas")

  .setAuthorizationBaseUrl(PropertiesService.getDocumentProperties().getProperty("base") + '/login/oauth2/auth?')
  .setTokenUrl(PropertiesService.getDocumentProperties().getProperty("base") + "/login/oauth2/token")

  .setClientId(PropertiesService.getDocumentProperties().getProperty('id'))
  .setClientSecret(PropertiesService.getDocumentProperties().getProperty('key'))

  .setCallbackFunction('authCallback')

  .setPropertyStore(PropertiesService.getUserProperties())
}


/**
 * authCallback - Callback data after authorizing Canvas access from the Addon
 *
 * @param  {Obj} request    Access request
 * @returns {String}        Update the UI with success/failure message
 */
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

/**
 * reset - Remove all stored credentials for the user.
 *
 * @returns {Obj}  Update the Addon UI. 
 */
function reset() {
  var ui = SpreadsheetApp.getUi();
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
