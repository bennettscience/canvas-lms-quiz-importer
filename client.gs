function checkAuth() {
  var canvasService = getCanvasService()
  Logger.log(canvasService.hasAccess())
  if(canvasService.hasAccess()) {
    var returnObj = {}
    
    var opts = {
      "enrollment_type": "teacher",
      "state": ["available"]
    }
    
    var url = "courses"
    var payload = JSON.stringify(opts);
    var classes = get(url, payload)
    
    Logger.log(classes);
    
  }
}

function getClasses() {
  var url = "courses"

  var classes = get(url);
  return JSON.parse(classes)
}

function getCourseQuizzes(id) {
  var url = "courses/" + id + "/quizzes"
    
  var quizzes = get(url)
    
  return JSON.parse(quizzes);
}