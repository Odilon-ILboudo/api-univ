import express from "express";
import admin from "../firebaseAdmin";

const router = express.Router();

// Enregistrer programme d'un cours
router.post("/schedule", async (req, res) => {
  const { courseId, sessions } = req.body;

  if (!courseId || !Array.isArray(sessions))
    return res.status(400).json({ error: "Invalid data" });

  try {
    await admin.firestore().collection("courses").doc(courseId).update({
      sessions,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Update failed" });
  }
}); 

// Récupérer planning d'un cours
router.get("/schedule", async (req, res) => {
  const { courseId } = req.query;

  if (!courseId)
    return res.status(400).json({ error: "courseId required" });

  try {
    const doc = await admin.firestore().collection("courses").doc(String(courseId)).get();

    return res.json(doc.data()?.sessions || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to read data" });
  }
});

export default router;
