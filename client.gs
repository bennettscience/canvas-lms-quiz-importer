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
  var canvasService = getCanvasService();

  if(canvasService.hasAccess()) {
    var url = "courses"

    var classes = get(url);
    
    Logger.log("Classes are: %s", JSON.parse(classes))
    Logger.log(typeof classes);
    Logger.log("This user has %s classes", classes.length)
  }
  return JSON.parse(classes)
}

function getCourseQuizzes(id) {
  var canvasService = getCanvasService();
  
  if(canvasService.hasAccess()) {
    var url = "courses/" + id + "/quizzes"
    
    var quizzes = get(url)
    
    return JSON.parse(quizzes);
  }
}