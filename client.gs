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

/**
 * postQuestion - Send the formatted question to the Canvas API
 *
 * @param  {Obj} item         Question object
 * @param  {Number} courseId  Canvas course number
 * @param  {Number} quizId    Individual quiz in the course
 * @returns {Obj | boolean}   Return a successful response or false if failure
 */
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
