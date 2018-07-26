# Canvas LMS Assessment Manager

This script allows you to interact with your Canvas Quizzes and Outcomes to bulk-upload items. Please read these instructions carefully.

## Setup
You need a Canvas API key for your account. Follow the instructions in the Setup menu to connect.
If you want to disconnect your account, use the Logout button to clear your API key.

## Quizzes
Canvas only allows questions to be uploaded directly to an existing quiz. To use the QuizTemplate sheet, you need to first create the quiz in your course.
Write your questions in the spreadsheet. All fields are required.
The only supported questions types are multiple choice or true/false at this time
Open the Quiz Item Upload sidebar and choose your course and quiz. If you add any questions, use the Rescan sheet button to update the question count before running the upload.

## Outcomes
Outcomes have to be added to an existing Outcome Group (folder). Create any folders you would like in your account before attempting to upload.
Use the OutcomeTemplate sheet and add your outcomes.
Outcomes scored on decaying_average or n_mastery require a calculation weight.
Open the Outcome Upload sidebar and choose the course you want to add outcomes to. If you add any before uploading, use the Rescan sheet button to update the number of items to post.
Set up your outcome rubric in the RubricScoring spreadsheet. Any outcome uploaded will use the defined points/descriptions. These can be changed after each upload.
