import express from "express";
import fetch from "node-fetch";
import cors from "cors"; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
const canvasBaseUrl = "https://rmit.instructure.com/api/v1/";
const apiToken =process.env.API_KEY;

app.use(express.static("public"));

app.get("/api/courses", async (req, res) => {
  try {
    const coursesResponse = await fetch(
      `${canvasBaseUrl}courses?access_token=${apiToken}`
    );
    if (!coursesResponse.ok) throw new Error("Error fetching courses");
    const courses = await coursesResponse.json();

    for (const course of courses) {
      const assignmentsResponse = await fetch(
        `${canvasBaseUrl}courses/${course.id}/assignments?access_token=${apiToken}`
      );
      if (!assignmentsResponse.ok)
        throw new Error(`Error fetching assignments for course ${course.id}`);
      const assignments = await assignmentsResponse.json();
      course.assignments = assignments;
    }

    res.json(courses);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/courses/:courseId/assignments", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const assignmentsResponse = await fetch(
      `${canvasBaseUrl}courses/${courseId}/assignments?access_token=${apiToken}`
    );
    if (!assignmentsResponse.ok)
      throw new Error(`Error fetching assignments for course ${courseId}`);
    const assignments = await assignmentsResponse.json();
    res.json(assignments);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
