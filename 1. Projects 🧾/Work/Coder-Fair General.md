## User
- role - value based from 1-5; This indicates the weight of your vote | **INT**
- coderName - non PII (should it be tied to a private file so we know who is who?) | **STRING**


## Student
- coderName - refer [[#User]]
- profilePictureURL - where should we store this? (Few options include Deta Base for simplicity also an option of Firebase, however this option might take too ) | **STRING**
- listOfProjects - will contain a list of [[#Project]]s | **List\<Project>**
- codeCoach - name of coach |  **STRING**
- thumbnailURL - image URL of game to put on the [[HOME SCREEN]] card (Chose this instead of option to display profile picture of student because: 1. more visually appealing 2. removes any bias towards a project; ) 


## Project
- title - title of the game or application | **STRING**
- 