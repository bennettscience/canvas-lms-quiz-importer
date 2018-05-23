function doGet(e) {
  var html = HtmlService.createHtmlOutputFromFile("auth");
  Logger.log(e.parameters);
  return html
}

/**
 * onInstall - Pass auth param to onOpen
 *
 * @param  {Obj} e    Authorization object
 */
function onInstall(e) {
  onOpen(e)
}

/**
 * getProps - Helper function to check for stored data
 *
 * @returns {Obj}  User-created properties defining application state and config options
 */
function getProps() {
  return PropertiesService.getDocumentProperties().getProperties();
}

/**
 * onOpen - Load the Addon menu based on authorization status
 *
 * @param  {Obj} e   Authorization object
 * @returns {Obj}    Create addon menu based on user authorization status
 */
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();

  if(e && e.authMode == ScriptApp.AuthMode.NONE) {
    ui.createAddonMenu().addItem("Setup", "setup").addToUi();
  } else {
    if(PropertiesService.getDocumentProperties().getProperty("auth") == "personal") {
      ui.createAddonMenu().addItem("Run", "openSidebar").addToUi();
    }
    if(canvasService.hasAccess()) {
      ui.createAddonMenu().addItem("Login", "login").addItem("Logout", "reset").addItem("Run", "openSidebar").addToUi();
    } else {
      if(!PropertiesService.getDocumentProperties().getProperty("id")) {
        ui.createAddonMenu().addItem("Setup", "setup").addToUi();
      } else {
        ui.createAddonMenu().addItem("Login", "login").addToUi();
      }
    }
  }
}


/**
 * showHelp - Popup dialog for the Addon menu
 *
 * @returns {Obj}  UI with information about the addon displayed to the user
 */
function showHelp() {
  return SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutputFromFile("help").setHeight(500).setWidth(700), "Canvas Quiz Uploader Help");
}


/**
 * installSelect - Store installation type in the setup flow
 *
 * @param  {String} type  User-defined installation settings
 * @returns {String}      HTML for the next step in the setup flow based on installation type
 */
function installSelect(type) {
  if(type.config == "school") {
    PropertiesService.getDocumentProperties().setProperty("auth", "school")
    return HtmlService.createHtmlOutputFromFile('schoolForm').getContent();

  } else if(type.config == "personal") {
    PropertiesService.getDocumentProperties().setProperty("auth", "personal");
    return HtmlService.createHtmlOutputFromFile('personalForm').getContent();
  } else {
    return ContentService.createTextOutput('<p>Something went wrong.<p>')
  }
}

/**
 * goBack - Return to the previous setup screen
 *
 * @param  {String} loc   Location to return to
 * @returns {String}      HTML-formatted UI
 */
function goBack(loc) {
  return HtmlService.createHtmlOutputFromFile(loc).getContent();
}

/**
 * openSidebar - Display the sidebar UI once the app has been set up
 *
 * @returns {Obj}  UI built from the HTML template
 */
function openSidebar() {
  var template = HtmlService.createTemplateFromFile("index").evaluate().setTitle("Canvas Quiz Uploader")
  SpreadsheetApp.getUi().showSidebar(template);
}

/**
 * getNumQuestions - Enumerate the number of questions in the spreadsheet
 *
 * @returns {String}  Last row in the spreadsheet
 */
function getNumQuestions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("QuizTemplate");
  return sheet.getLastRow()-1;
}

/**
 * readSheet - Get the data and return it to the client for posting to the API
 *
 * @param  {Number} n   The number of questions to collect
 * @returns {data[]}    Array of questions for upload to the Canvas API
 */
function readSheet(n) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QuizTemplate');
  if(n == "") {
    n = sheet.getLastRow();
  }
  var lastRow = checkLastRow();
  var data = sheet.getRange(lastRow, 1, n, 10).getValues();

  return data;
}

/**
 * checkLastRow - Find the next row to be uploaded
 *
 * @returns {Number}  Row number to be uploaded
 */
function checkLastRow() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QuizTemplate');
  var range = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  for(var i=0; i<range.length; i++) {
    if(!range[i][9]) {
      return i+2;
    }
  }
}

/**
 * sendQuestion - Post a question to the Canvas API
 *
 * @param  {Array[]} data     Question row as an array
 * @param  {Number} i         Row index for updating the UI
 * @param  {Number} courseId  Canvas course ID
 * @param  {Number} quizId    Individual quiz within the specified course
 * @returns {Obj}             Response object from the API
 */
function sendQuestion(data, i, courseId, quizId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("QuizTemplate");

  var title = data[8].toString();
  var item = buildQuestion(data,title)

  var req = postQuestion(item, courseId, quizId);

  if(req) {
    sheet.getRange(i, 10).setValue("Success")
  }
}

/**
 * buildQuestion - Coerce the row data into a Question object
 *
 * @param  {Array[]} row    Question data read from the spreadsheet
 * @param  {String} title   titles the quiz question for display in the Canvas quiz
 * @returns {Obj}           Question object specified in the Canvas Open API Docs
 */
function buildQuestion(row, title) {
  var data = {
    "question": {
      "question_name": title,
      "question_text":row[1],
      "question_group_id":"",
      "question_type":row[0],
      "points_possible":1,
      "answers": [
        {
          "answer_text": row[2],
          "weight": 100.0
        },
        {
          "answer_text": row[3],
          "weight": 0.0
        },
        {
          "answer_text": row[4],
          "weight": 0.0
        },
        {
          "answer_text": row[5],
          "weight": 0.0
        },
        {
          "answer_text": row[6],
          "weight": 0.0
        }
      ]
    }
  }
  return data
}

/**
 * spreadsheetSetup - Format the template if one doesn't already exist
 *
 * @returns {boolean}
 */
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
