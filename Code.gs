function doGet(e) {
  var html = HtmlService.createHtmlOutputFromFile("auth");
  Logger.log(e.parameters);
  return html
}

function onInstall(e) {
  onOpen(e)
}

function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  
  Logger.log(e);
  
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

function goBack(loc) {
  Logger.log(loc)
  return HtmlService.createHtmlOutputFromFile(loc).getContent();
}

function openSidebar() {
  var template = HtmlService.createTemplateFromFile("index").evaluate().setTitle("Canvas Quiz Importer")
  Logger.log(template);
  SpreadsheetApp.getUi().showSidebar(template);
}

function getProps() {
  return PropertiesService.getDocumentProperties().getProperties();
}

function getNumQuestions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("QuizTemplate");
  return sheet.getLastRow()-1;
}

function readSheet(n) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QuizTemplate');
  if(n == "") {
    n = sheet.getLastRow();
  }

  var lastRow = checkLastRow();
  var data = sheet.getRange(lastRow, 1, n, 10).getValues();
  
  return data;
}

function checkLastRow() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QuizTemplate');
  var range = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  for(var i=0; i<range.length; i++) {
    if(!range[i][9]) {
      return i+2;
    }
  }
}

function sendQuestion(data, i, courseId, quizId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("QuizTemplate");

  var title = data[8].toString();
  var item = buildQuestion(data,title)

  var req = postQuestion(item, courseId, quizId);
  
  if(req) {
    sheet.getRange(i, 10).setValue("Success")
  } 
}

function buildQuestion(row, title) {
  Logger.log(row)
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

function postQuestion(item, courseId, quizId) {
  var url = "courses/" + courseId + "/quizzes/" + quizId + "/questions"
  
  Logger.log(url)
  var payload = JSON.stringify(item);
  
  var resp = post(url, payload)
  if(resp) { 
    return resp 
  } else {
    return false
  }
}