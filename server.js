// import express from "express";
// import fetch from "node-fetch";
// import cors from "cors"; 

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors()); 
// const canvasBaseUrl = "https://rmit.instructure.com/api/v1/";
// const apiToken = process.env.API_KEY;


// app.use(express.static("public"));

// app.get("/api/courses", async (req, res) => {
//   try {
//     const coursesResponse = await fetch(
//       `${canvasBaseUrl}courses?access_token=${apiToken}`
//     );
//     if (!coursesResponse.ok) throw new Error("Error fetching courses");
//     const courses = await coursesResponse.json();

//     for (const course of courses) {
//       const assignmentsResponse = await fetch(
//         `${canvasBaseUrl}courses/${course.id}/assignments?access_token=${apiToken}`
//       );
//       if (!assignmentsResponse.ok)
//         throw new Error(`Error fetching assignments for course ${course.id}`);
//       const assignments = await assignmentsResponse.json();
//       course.assignments = assignments;
//     }

//     res.json(courses);
//   } catch (error) {
//     console.error("Fetch error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.get("/api/courses/:courseId/assignments", async (req, res) => {
//   try {
//     const courseId = req.params.courseId;
//     const assignmentsResponse = await fetch(
//       `${canvasBaseUrl}courses/${courseId}/assignments?access_token=${apiToken}`
//     );
//     if (!assignmentsResponse.ok)
//       throw new Error(`Error fetching assignments for course ${courseId}`);
//     const assignments = await assignmentsResponse.json();
//     res.json(assignments);
//   } catch (error) {
//     console.error("Fetch error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



// ^^^^^^^^
// if you want to create this server please use the commented code instead and DO NOT use the below code.. 
// i moved from DIP of IT to CLOUD ENGINEERING and RMIT didn't enroll me correctly that's why i was forced
// to use each course ID. 




import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
const canvasBaseUrl = "https://rmit.instructure.com/api/v1/";
const apiToken = process.env.API_KEY;

app.use(express.static("public"));

const getDateWithoutTime = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const courseIds = {
  "129982": "ICT Projects",
  "129988": "Create Scripts for Networking",
  "129987": "Design, build and test network servers",
  "129983": "Implement cloud infrastructure with code",
  "129984": "Implement virtual network in cloud environments",
  "129986": "Manage infrastructure in cloud environments",
  "129989": "Manage network security",
  "129981": "Apply intermediate object-oriented language skills",
  "129985": "Build and deploy resources on cloud platforms"
};

app.get("/api/courses", async (req, res) => {
  try {
    const courseDataPromises = Object.keys(courseIds).map(async courseId => {
      const assignmentsResponse = await fetch(
        `${canvasBaseUrl}courses/${courseId}/assignments?access_token=${apiToken}`
      );
      if (!assignmentsResponse.ok)
        throw new Error(`Error fetching assignments for course ${courseId}`);
      const assignments = await assignmentsResponse.json();

      const today = getDateWithoutTime(new Date());
      const filteredAssignments = assignments.filter(assignment => {
        const dueDate = new Date(assignment.due_at);
        return dueDate > today;
      });

      return {
        id: courseId,
        name: courseIds[courseId],
        assignments: filteredAssignments
      };
    });

    const courseData = await Promise.all(courseDataPromises);
    res.json(courseData);
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

    const today = getDateWithoutTime(new Date());
    const filteredAssignments = assignments.filter(assignment => {
      const dueDate = new Date(assignment.due_at);
      return dueDate > today;
    });

    res.json(filteredAssignments);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
