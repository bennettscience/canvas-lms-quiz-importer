
/**
 * storePersonalKey - Save user's API key
 *
 * @param {Object}  form.key  User API key
 * @param {Object}  form.base User Canvas base URL
 * @returns {String}
 */
function storePersonalKey(form) {
  PropertiesService.getUserProperties().setProperties(form);
  SpreadsheetApp.getUi().createMenu("Canvas Assessment Manager").addItem("Upload Quiz Items", "openQuizSidebar").addItem("Upload Outcomes", "openOutcomeSidebar").addSeparator().addItem("Logout", "reset").addSeparator().addItem("Help", "showHelp").addToUi();
  spreadsheetSetup();
  return "<p>Your account is now ready to use. You can close this dialog and use the Quiz or Outcome upload options in the menu.</p>"
}

/**
 * setup - Display setup popup
 *
 * @returns {Object}
 */
function setup() {
  return SpreadsheetApp.getUi().showModalDialog(HtmlService.createTemplateFromFile("setup").evaluate().setHeight(500).setWidth(700), "Connect to Canvas")
}

/**
 * getBaseUrl - Return formatted base URL for API calls
 *
 * @returns {String}
 */
function getBaseUrl() {
  var base = PropertiesService.getUserProperties().getProperty("base");
  return base + "/api/v1/"
}

/**
 * reset - Clear user credentials from PropertiesService
 */
function reset() {
  var ui = SpreadsheetApp.getUi();
  PropertiesService.getUserProperties().deleteAllProperties();

  ui.createMenu("Canvas Assessment Manager").addItem("Setup", "setup").addSeparator().addItem("Help","showHelp").addToUi();
}
