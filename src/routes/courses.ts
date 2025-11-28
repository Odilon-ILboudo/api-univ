// api/courseRoutes.ts
import express from "express";
import { v4 as uuidv4 } from "uuid";
import admin from "../../firebaseAdmin";

const router = express.Router();
const db = admin.firestore();

/* ---------------------------
   Create Course
---------------------------- */
router.post("/create-course", async (req, res) => {
  const { name, credits, semester, teacher, level, field, department } = req.body;

  if (!name || !credits || !semester || !teacher || !level || !field || !department) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  try {
    const id = uuidv4();

    await db.collection("courses").doc(id).set({
      id, name, credits, semester, teacher, level, field, department,
    });

    return res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------------
   Get Courses with filters
---------------------------- */
router.get("/courses", async (req, res) => {
  const { level, field, department, semester } = req.query;

  if (!level || !field || !department) {
    return res.status(400).json({ error: "Filtres requis" });
  }

  try {
    const snapshot = await db.collection("courses").get();

    const courses = snapshot.docs
      .map((d) => d.data())
      .filter(
        (c) =>
          c.level === level &&
          c.field === field &&
          c.department === department &&
          (semester ? Number(c.semester) === Number(semester) : true)
      );

    return res.json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------------
   Get courses by teacher
---------------------------- */
router.get("/courses/teacher/:teacherName", async (req, res) => {
  const { teacherName } = req.params;

  try {
    const snapshot = await db.collection("courses").get();
    const courses = snapshot.docs
      .map((d) => d.data())
      .filter((c) => c.teacher.toLowerCase().includes(teacherName.toLowerCase()));

    return res.json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------------
   Assignments
---------------------------- */
router.get("/assignments", async (req, res) => {
  try {
    const snapshot = await db.collection("assignments").get();
    const assignments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(assignments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/assignments", async (req, res) => {
  try {
    const data = req.body;
    await db.collection("assignments").add(data);
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------------
   Course Resources
---------------------------- */
router.get("/course-resources", async (req, res) => {
  try {
    const snapshot = await db.collection("course-resources").get();
    const resources = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(resources);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/course-resources", async (req, res) => {
  try {
    const data = req.body;
    await db.collection("course-resources").add(data);
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------------
   Submissions
---------------------------- */
router.get("/submissions", async (req, res) => {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ error: "studentId requis" });

  try {
    const snapshot = await db.collection("submissions").where("studentId", "==", studentId).get();
    const submissions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(submissions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/submissions", async (req, res) => {
  try {
    const data = req.body;
    await db.collection("submissions").add(data);
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------------
   Grades per student
---------------------------- */
router.get("/courses/grades/student/:studentId", async (req, res) => {
  const { studentId } = req.params;
  if (!studentId) return res.status(400).json({ error: "studentId requis" });

  try {
    const coursesSnap = await db.collection("courses").get();
    const grades: any[] = [];

    coursesSnap.forEach((doc) => {
      const course = doc.data();
      if (Array.isArray(course.grades)) {
        const match = course.grades.find((g) => g.id === studentId);
        if (match) {
          grades.push({
            id: doc.id,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code ?? null,
            semester: course.semester,
            coefficient: course.coefficient ?? 1,
            type: "Examen",
            date: course.sessions?.[0]?.date ?? new Date().toISOString(),
            value: match.grade,
            maxValue: 20,
            studentId,
          });
        }
      }
    });

    return res.json(grades);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
