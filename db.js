//courses JSON
[
  {
    "id": "CS101",
    "title": "Intro to Computer Science",
    "instructor": "Dr. Smith",
    "availableSeats": 2,
    "schedule": {
        "courseId": "CS101",
        "day": "Monday",
        "start": 9,
        "end": 11
    },
    "waitlist": []
  },
]

//students JSON
[
  {
    "id": "1",
    "name": "John Doe",
    "courses": [],
    "notifications": []
  }
]

//overrides JSON
[]
 
//packaging JSON
{
    "name": "course-portal-api",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": {
        "start": "node server.js"
    },
    "dependencies": {
        "express": "^4.18.1"
    }
}