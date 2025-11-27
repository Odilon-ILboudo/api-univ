import express from "express";
import admin from "firebase-admin";

const router = express.Router();
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const doc = await db.collection("settings").doc("academicYear").get();

    if (!doc.exists) {
      return res.status(200).json({ message: "No data yet", data: null });
    }

    return res.status(200).json(doc.data());
  } catch (error) {
    console.error("Error fetching academic year:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    await db.collection("settings").doc("academicYear").set(data, { merge: true });

    return res.status(200).json({
      message: "Academic year updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error saving academic year:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
