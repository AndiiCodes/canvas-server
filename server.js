import express from "express";
import fetch from "node-fetch";
import cors from "cors"; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.static("public"));

const canvasBaseUrl = "https://rmit.instructure.com/api/v1/";
const apiToken = process.env.API_KEY;

if (!apiToken) {
  console.error("API Key is missing! Set API_KEY in environment variables.");
  process.exit(1);
}


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchAllCourses() {
  let courses = [];
  let url = `${canvasBaseUrl}courses?per_page=100&include[]=enrollments&enrollment_state[]=active&enrollment_state[]=completed&enrollment_state[]=past`;

  while (url) {
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Error fetching courses: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    courses = courses.concat(data);

    
    const linkHeader = response.headers.get("link");
    const nextPageMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
    url = nextPageMatch ? nextPageMatch[1] : null;

   
    await delay(500);
  }

  return courses;
}


app.get("/api/courses", async (req, res) => {
  try {
    const courses = await fetchAllCourses();
    
    
    console.log("Fetched courses:", courses.map(c => c.name));

    res.json(courses);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/api/courses/:courseId/assignments", async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignmentsResponse = await fetch(
      `${canvasBaseUrl}courses/${courseId}/assignments`, {
        headers: { "Authorization": `Bearer ${apiToken}` },
      }
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


// app.get("/api/courses/programming-a", async (req, res) => {
//   try {
//     const courses = await fetchAllCourses();
//     const programmingA = courses.find(course => course.name.includes("Programming A"));

//     if (!programmingA) {
//       return res.status(404).json({ message: "Programming A not found" });
//     }

//     res.json(programmingA);
//   } catch (error) {
//     console.error("Fetch error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});






// ^^^^^^^^
// if you want to create this server please use the above code instead and DO NOT use the below code.. 
// i moved from DIP of IT to CLOUD ENGINEERING and RMIT didn't enroll me correctly that's why i was forced
// to use each course ID. 




// import express from "express";
// import fetch from "node-fetch";
// import cors from "cors";

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// const canvasBaseUrl = "https://rmit.instructure.com/api/v1/";
// const apiToken = "";

// app.use(express.static("public"));

// const getDateWithoutTime = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// const courseIds = {
//   "129982": "ICT Projects",
//   "129988": "Create Scripts for Networking",
//   "129987": "Design, build and test network servers",
//   "129983": "Implement cloud infrastructure with code",
//   "129984": "Implement virtual network in cloud environments",
//   "129986": "Manage infrastructure in cloud environments",
//   "129989": "Manage network security"
// };

// app.get("/api/courses", async (req, res) => {
//   try {
//     const courseDataPromises = Object.keys(courseIds).map(async courseId => {
//       const assignmentsResponse = await fetch(
//         `${canvasBaseUrl}courses/${courseId}/assignments?access_token=${apiToken}`
//       );
//       if (!assignmentsResponse.ok)
//         throw new Error(`Error fetching assignments for course ${courseId}`);
//       const assignments = await assignmentsResponse.json();

//       const today = getDateWithoutTime(new Date());
//       const filteredAssignments = assignments.filter(assignment => {
//         const dueDate = new Date(assignment.due_at);
//         return dueDate > today;
//       });

//       return {
//         id: courseId,
//         name: courseIds[courseId],
//         assignments: filteredAssignments
//       };
//     });

//     const courseData = await Promise.all(courseDataPromises);
//     res.json(courseData);
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

//     const today = getDateWithoutTime(new Date());
//     const filteredAssignments = assignments.filter(assignment => {
//       const dueDate = new Date(assignment.due_at);
//       return dueDate > today;
//     });

//     res.json(filteredAssignments);
//   } catch (error) {
//     console.error("Fetch error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
