import express from "express";
import admin from "../firebaseAdmin";

const router = express.Router();
const db = admin.firestore();

/**
 * POST /api/grades
 * body: { courseId: string, students: [{ id: string, grade: number | null }] }
 */
router.post("/", async (req, res) => {
  const { courseId, students } = req.body;

  if (!courseId || !Array.isArray(students)) {
    return res.status(400).json({ error: "Données invalides (courseId, students)" });
  }

  try {
    const courseRef = db.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return res.status(404).json({ error: "Cours non trouvé" });
    }

    await courseRef.update({
      grades: students.map((s: any) => ({ id: s.id, grade: s.grade ?? null })),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("POST /api/grades ERROR:", err);
    return res.status(500).json({ error: "Impossible de sauvegarder les notes" });
  }
});

/**
 * GET /api/grades?courseId=...
 */
router.get("/", async (req, res) => {
  const { courseId } = req.query;

  if (!courseId || typeof courseId !== "string") {
    return res.status(400).json({ error: "courseId requis" });
  }

  try {
    const doc = await db.collection("courses").doc(courseId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Cours non trouvé" });
    }

    const data = doc.data() || {};
    const grades = Array.isArray(data.grades) ? data.grades : [];

    return res.status(200).json(grades);
  } catch (err) {
    console.error("GET /api/grades ERROR:", err);
    return res.status(500).json({ error: "Impossible de récupérer les notes" });
  }
});

/**
 * GET /api/grades/student/:studentId
 */
router.get("/student/:studentId", async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ error: "studentId requis" });
  }

  try {
    const snapshot = await db.collection("courses").get();
    const grades: any[] = [];

    snapshot.docs.forEach((doc) => {
      const course = doc.data();
      if (Array.isArray(course.grades)) {
        const gradeEntry = course.grades.find((g: any) => g.id === studentId);
        if (gradeEntry) {
          grades.push({
            studentId,
            courseId: course.id,
            courseName: course.name,
            value: gradeEntry.grade,
          });
        }
      }
    });

    return res.status(200).json(grades);
  } catch (err) {
    console.error("GET /api/grades/student/:studentId ERROR:", err);
    return res.status(500).json({ error: "Impossible de récupérer les notes" });
  }
});

export default router;
