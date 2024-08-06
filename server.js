import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
const canvasBaseUrl = "https://rmit.instructure.com/api/v1/";
const apiToken = process.env.API_KEY;

app.use(express.static("public"));

const fetchAllPages = async (url) => {
  let results = [];
  let nextUrl = url;

  while (nextUrl) {
    const response = await fetch(nextUrl);
    if (!response.ok) throw new Error("Error fetching data");
    const data = await response.json();
    results = results.concat(data);

    // Parse the link header to find the next page URL
    const linkHeader = response.headers.get("link");
    if (linkHeader) {
      const links = linkHeader.split(",").reduce((acc, link) => {
        const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
        if (match) {
          acc[match[2]] = match[1];
        }
        return acc;
      }, {});
      nextUrl = links.next || null;
    } else {
      nextUrl = null;
    }
  }

  return results;
};

app.get("/api/courses", async (req, res) => {
  try {
    const coursesUrl = `${canvasBaseUrl}courses?access_token=${apiToken}&enrollment_state=all`;
    const courses = await fetchAllPages(coursesUrl);

    for (const course of courses) {
      const assignmentsUrl = `${canvasBaseUrl}courses/${course.id}/assignments?access_token=${apiToken}`;
      course.assignments = await fetchAllPages(assignmentsUrl);
    }

    res.json(courses);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

app.get("/api/courses/:courseId/assignments", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const assignmentsUrl = `${canvasBaseUrl}courses/${courseId}/assignments?access_token=${apiToken}`;
    const assignments = await fetchAllPages(assignmentsUrl);
    res.json(assignments);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
