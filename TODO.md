# Phase 1

## Main Tasks

## Daniel Tasks

- [x] Create a reusable Weekly Schedule Viewer component in HTML, and then migrate it into JavaScript by creating a function to insert the HTML anywhere we desire. This component will display the user's current schedule and how adding certain classes will change their schedule.
- [x] Create a reusable Course Map component in HTML, and then migrate it into JavaScript by creating a function to insert the HTML anywhere we desire. This component will show the route the student will have to take for each course, and show the locations of the courses during course search.
- [x] Create a dynamic layout for the full application that includes the navbar and content for the mobile view, and the navbar, sidebar, and content for the desktop view. Dynamically swapping between them based on screen width.
- [x] Create a reusable Course Item List component to show the list of courses that we fetch from the server. Then, integrate it into a Catalog page. The page will have searching and filtering built in.
- [x] Write a deployment script to automatically deploy our app to Azure, potentially integrating it with GitHub Actions.

## Aaron Tasks

- [x] Initialize the backend. Set up the folder structure, create a server.js, install dependencies from npm such as nodemon and express, and configure environment variables in .env.
- [x] Take a large-scale dataset of courses that are offered at NAU from "https://api.extended.nau.edu/api/CourseCatalog"(no longer available, but cached locally in JSON format) and parse it to extract prerequisites, corequisites, and more. Then, for each course, generate an array of class times and waitlist statuses, and finally combine all the data into a single JSON array.
- [x] Implement GET /api/courses/:id and /api/courses?q=x&limit=y&offset=z. Using url query parameters to filter the list of courses in the catalog. Some filters include: q=search_query, limit=pagination_limit, offset=pagination_offset, instructor=instructor_query, subject=subject_id, etc. Noting that search_query searches generally through all the information in a given course.
- [x] Implement GET /api/students/:id/courses. Fetching the students' current enrolled courses based on their student ID. Allowing for a body to the request to contain {additional_course_ids: []} to display.
- [x] Implement a JSON database to store information about students. Storing their enrolled courses, notifications, and waitlisted courses.

## Derrick Tasks

- [x] Develop all of the boilerplate for the entire backend API, instantiating an Express app, exposing a port, and creating empty API route paths. (GET /api/courses/:id, GET /api/courses?limit=x&offset=y, POST /api/students/:id/course/:id/enroll, DELETE /api/students/:id/courses/:id/, POST /api/students/:id/course/:id/waitlist, DELETE /api/students/:id/courses/:id/waitlist, etc…)
- [x] Implement POST /api/students/:id/courses/:id/enroll. Checking for conflicts with the current schedule and then properly updating the database to reflect the new open seats. This will also trigger a notification to be added to the student's data.
- [x] Implement DELETE /api/students/:id/courses/:id/drop. Ensure proper updating of the database to reflect the new open seats. This will also trigger a notification to be added to the student's data.
- [x] Implement GET /api/students/:id/schedule. Fetching the students' current schedule for their course to be displayed on the Weekly Schedule Component.
- [x] Implement a JSON database to store the override requests from the override request. Storing the information like {id: 0, name: "", email: "", sid: "", course_id: "", reason: "", date: ""}.

## Other Tasks

# Phase 2

## Main Tasks

## Daniel Tasks

- [x] Create the My Enrollments page, fetching the enrolled courses, listing them, and allowing the user to modify them.
- [x] Create the Override Request page. If the user's prerequisites aren't met for a given course (verified by the backend), then allow the user to send an override to the backend. The form will contain fields like: name, email, course, and reason. With some fields being autopopulated if navigated to this page from a Course Details page.
- [x] Create the Course Details page. Display information about a course, such as the credits, name, subject, course number, session, career, section, days and times, room, instructor, and whether the course is still open, can be waitlisted, or is closed.
- [x] Create the Notifications page. Show previous notifications that haven't been read. The main notifications would be if a course was successfully enrolled or dropped, an override was approved or denied, or a waitlisted course became enrolled.
- [x] Take the parsed Ajax calls and implement the functionality that occurs on success and on error for each one.

## Aaron Tasks

- [x] Implement POST /api/students/:id/waitlist/:id. This will add a student to a waitlist for a specific course ID. This will also trigger a notification to be added to the student's data.
- [x] Implement DELETE /api/students/:id/waitlist/:id. This will delete a student from a waitlist for a specific course ID. This will also trigger a notification to be added to the student's data.
- [x] Implement a system that locks the database whenever it's about to be modified to prevent multiple writes at the same time. Then, when it unlocks, do the next request and repeat.
- [x] Implement GET /api/students/:id/map. Fetching the students' current enrolled courses map based on their student ID to be displayed on the Course Map Component. Allowing for a body to the request to contain {additional_course_ids: []} to display.
- [x] Write the frontend parser that checks the pathname and extracts the query params, which then calls the correct JQuery Ajax calls.

## Derrick Tasks

- [x] Implement GET /api/students/:id/notifications. This will fetch all notifications for a specific student. Implement GET /api/students/:id/notifications/unread/ This will fetch how many unread notifications the student has.
- [x] Implement POST /api/override. Taking in the body: {id: 0, name: "", email: "", sid: "", course_id: "", reason: "", date: ""}. Store this request in an override request JSON database to be evaluated.
- [x] Implement a private endpoint POST /api/override/accept Which accepts an override request ID and accepts it. Updating the courses database and the students database. Then, send out a notification to the user informing them.
- [x] Implement a private endpoint POST /api/override/deny Which accepts an override request ID and denies it. Updating the courses database and the students database. Then, send out a notification to the user informing them.
- [x] For each subject in the JSON database, assign them a location, along with creating a coordinates map for each location.

## Other Tasks
