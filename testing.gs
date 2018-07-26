function getProps() {
  var props = PropertiesService.getUserProperties().getProperties()
  return props;
}

function getGroups(id) {
  var url = "courses/24485/outcome_group_links?per_page=100"
  var data = get(url)

  var outcomes = JSON.parse(data);
  
  var list = [];
  
  for(var i=0; i<outcomes.length; i++) {
    Logger.log(outcomes[i]);
    
    list.push(outcomes[i].outcome_group.title);
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1")
  var range = sheet.getRange(2,1,50,1);
  
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(list, true);
  
  range.setDataValidation(rule).setBackground("pale yellow")
}