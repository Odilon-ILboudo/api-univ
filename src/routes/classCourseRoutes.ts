// api/classCourseRoutes.ts
import express from "express";
import admin from "../firebaseAdmin";

const router = express.Router();
const db = admin.firestore();

// ========================
// GET /classes
// ========================
router.get("/classes", async (req, res) => {
  try {
    const snapshot = await db.collection("classes").get();
    const classes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// ========================
// GET /courses?classId=XX&semester=YY
// ========================
router.get("/courses", async (req, res) => {
  const { classId, semester } = req.query;

  if (!classId || !semester) {
    return res.status(400).json({ error: "classId et semester requis" });
  }

  try {
    const allCoursesSnap = await db.collection("courses").get();
    const allCourses = allCoursesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const assignedSnap = await db
      .collection("class_courses")
      .where("classId", "==", classId)
      .where("semester", "==", Number(semester))
      .get();

    const assignedCourseIds = assignedSnap.docs.map((doc) => doc.data().courseId);

    const assignedCourses = allCourses.filter((c) => assignedCourseIds.includes(c.id));
    const availableCourses = allCourses.filter((c) => !assignedCourseIds.includes(c.id));

    return res.json({ assignedCourses, availableCourses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// ========================
// POST /assign-course-to-class
// ========================
router.post("/assign-course-to-class", async (req, res) => {
  const { classId, semester, courseId } = req.body;
  if (!classId || !semester || !courseId) {
    return res.status(400).json({ error: "classId, semester et courseId requis" });
  }

  try {
    await db.collection("class_courses").add({
      classId,
      semester,
      courseId,
      createdAt: new Date(),
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("Error assigning course:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// ========================
// POST /remove-course-from-class
// ========================
router.post("/remove-course-from-class", async (req, res) => {
  const { classId, semester, courseId } = req.body;
  if (!classId || !semester || !courseId) {
    return res.status(400).json({ error: "classId, semester et courseId requis" });
  }

  try {
    const snapshot = await db
      .collection("class_courses")
      .where("classId", "==", classId)
      .where("semester", "==", Number(semester))
      .where("courseId", "==", courseId)
      .get();

    snapshot.forEach((doc) => doc.ref.delete());

    return res.json({ success: true });
  } catch (err) {
    console.error("Error removing assigned course:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
