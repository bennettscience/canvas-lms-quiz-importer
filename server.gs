/**
 * getProps - Helper function to check for stored data
 *
 * @returns {Obj}  User-created properties defining application state and config options
 */
function getProps() {
  return PropertiesService.getUserProperties().getProperties();
}

/**
 * onOpen - Load the Addon menu based on authorization status
 *
 * @param  {Obj} e   Authorization object
 * @returns {Obj}    Create addon menu based on user authorization status
 */
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  var base = PropertiesService.getUserProperties().getProperty("base");
  if(!base) {
    ui.createMenu('Canvas Assessment Manager').addItem("Setup", "setup").addSeparator().addItem("Help", "showHelp").addToUi();
  } else {
     ui.createMenu('Canvas Assessment Manager').addItem('Upload Quiz Items', 'openQuizSidebar').addItem('Upload Outcomes', 'openOutcomeSidebar').addSeparator().addItem('Logout', 'reset').addSeparator().addItem("Help","showHelp").addToUi();
  }
}

/**
 * showHelp - Popup dialog for the Addon menu
 *
 * @returns {Obj}  UI with information about the addon displayed to the user
 */
function showHelp() {
  return SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutputFromFile("help").setHeight(500).setWidth(700), "Canvas Assessment Manager BETA Help");
}

/**
 * readSheet - Get the data and return it to the client for posting to the API
 *
 * @param  {Number} n   The number of questions to collect
 * @returns {data[]}    Array of questions for upload to the Canvas API
 */
function readSheet(n, name) {
  Logger.log(n)
  Logger.log(sheet)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if(n == "") {
    n = sheet.getLastRow()-1;
  }
  
  var nextRow = findNextRow(name);
  var data = sheet.getRange(nextRow, 1, n, sheet.getLastColumn()-1).getValues();

  return data
}

/**
 * openSidebar - Display the sidebar UI once the app has been set up
 *
 * @returns {Obj}  UI built from the HTML template
 */
function openQuizSidebar() {
  var template = HtmlService.createTemplateFromFile("quiz-items").evaluate().setTitle("Canvas Quiz Uploader")
  SpreadsheetApp.getUi().showSidebar(template);
}

function openOutcomeSidebar() {
  var template = HtmlService.createTemplateFromFile("outcomes").evaluate().setTitle("Canvas Outcome Uploader")
  SpreadsheetApp.getUi().showSidebar(template);
}

/**
 * getNumQuestions - Enumerate the number of questions in the spreadsheet
 *
 * @returns {String}  Last row in the spreadsheet
 */
function getNumItems() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  return sheet.getLastRow()-1;
}

/**
 * checkLastRow - Find the next row to be uploaded
 *
 * @returns {Number}  Row number to be uploaded
 */
function findNextRow(sheet) {
  Logger.log("Lin 85: " + sheet);
  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet)
  var range = sheet.getDataRange().getValues();
  for(var i=1; i<range.length; i++) {
    if(!range[i][sheet.getLastColumn()-1]) {
      return i+1;
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
function postQuestion(data, i, courseId, quizId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("QuizTemplate");
  var url = "courses/" + courseId + "/quizzes/" + quizId + "/questions"
  
  var title = data[8].toString();

  var item = buildQuestion(data, title)
  
  var payload = JSON.stringify(item);
  var resp = post(url, payload)
  
  if(resp) {
    sheet.getRange(i, 10).setValue("Success")
    return resp
  } else {
    return false
  }
}

function postOutcome(data, i, courseId) {
  Logger.log(i)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('OutcomeTemplate');
  var group = data[0];
  
  var url = "courses/" + courseId + "/outcome_groups/" + group + "/outcomes";

  var item = buildOutcome(data[1], data[2], data[3], data[4], data[5])
  var payload = JSON.stringify(item)
  
  var req = post(url, payload);
  
  if(req) {
    sheet.getRange(i, 7).setValue("Success");
  }
} 

function getRatings() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RubricScoring');
  var rows = sheet.getRange(2, 1, sheet.getLastRow()-1, 2).getValues();
 
  Logger.log(rows);
  
  var jsonArray = [];
  
  for(var i=0; i<rows.length; i++) {
    jsonArray.push({ 'description': rows[i][0].toString(), 'points': rows[i][1].toString() });
  }
  
  return jsonArray;
}

function buildOutcome(title, desc, points, method, int) {
  // Get the ratings from the helper sheet
  var ratings = getRatings();
  
  var data = {
    "title": title,
    "description": desc,
    "calculation_method": method,
    "calculation_int": int,
    "ratings": ratings,
    "mastery_points": points
  } 
  return data;
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

function spreadsheetSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet;
  if(ss.getSheetByName("QuizTemplate") == null) {
    sheet = ss.insertSheet('QuizTemplate')
    
    sheet.getRange(1, 1, 1, 10).setValues([ ['Question Type','Description','Correct Answer','Distractor','Distractor','Distractor','Distractor','Topic','Primary Standard Indicator','Success'] ]);
    sheet.setColumnWidths(1, 2, 300).setFrozenRows(1);
    
    var validationRange = sheet.getRange(2,1,50,1);
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(["multiple_choice_question","true_false_question"], true);
    
    validationRange.setDataValidation(rule);
  }
  if(ss.getSheetByName("OutcomeTemplate") == null) {
    sheet = ss.insertSheet('OutcomeTemplate')
    
    sheet.getRange(1, 1, 1, 7).setValues([ ['Outcome Group', 'Outcome Title', 'Outcome Description', 'Mastery Score', 'Calculation Method', 'Average Weight', 'Status'] ]);
    
    validationRange = sheet.getRange(2, 5, 50, 1);
    rule = SpreadsheetApp.newDataValidation().requireValueInList(["decaying_average", "n_mastery", "latest", "highest"])
    validationRange.setDataValidation(rule);
    
    sheet.getRange(1, 1).setNote("Find the group numeric code by opening the Outcome sidebar and selecting a course.")
    sheet.getRange(1, 6).setNote("Weight of last attempt, 1-99.\n\n Only required for `decaying_average` or `n_mastery` outcomes.")
    
    sheet.setColumnWidths(2, 2, 300)
    sheet.setFrozenRows(1);  
  }
  return true;
}

function getClasses() {
  // This is hacky.
  var url = "courses?per_page=100&enrollment_type=teacher&status=active"
  
  var opts = {
    "per_page": 100,
    "enrollment_type": "teacher",
    "status": "active"
  }
  
  var payload = JSON.stringify(opts);

  var classes = get(url);
  Logger.log(classes);
  return JSON.parse(classes)
}

function getCourseQuizzes(id) {
  var url = "courses/" + id + "/quizzes"
  var quizzes = get(url)
  return JSON.parse(quizzes);
}

function getOutcomeGroups(id) {
//  var url = "courses/24485/outcome_groups?per_page=100";
  var url = "courses/" + id + "/outcome_groups?per_page=100";
  var data = [];
  
  var json = JSON.parse(get(url));
  for(var i=0; i<json.length; i++) {
    data.push({"id": json[i].id, "title": json[i].title})
  }
  
  data.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ); 

  return JSON.stringify(data);
}