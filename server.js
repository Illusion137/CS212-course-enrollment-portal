const express = require('express');
const app = express();
const PORT = pprocess.env.PORT || 5000;

app.use(express.json());

// Routes
app.use ("/api/courses", require("./routes/courses"));
app.use ("/api/students", require("./routes/students"));
app.use ('/api/overrides', require('./routes/overrides'));

app.get("/", (req, res) => {
    res.send("Course Enrollment API is Running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
