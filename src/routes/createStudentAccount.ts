// api/routes/students.ts
import express from "express";
import admin from "../firebaseAdmin";

const router = express.Router();

/* -------------------------------
   Création d'un étudiant
--------------------------------- */
router.post("/", async (req, res) => {
  const {
    firstName,
    lastName,
    studentId,
    ineNumber,
    emailPersonal,
    phone,
    address,
    nationality,
    emergencyContact,
    level,
    specialization,
    department,
    dateOfBirth,
  } = req.body;

  if (!firstName || !lastName || !studentId) {
    return res.status(400).json({ error: "Prénom, nom et studentId obligatoires" });
  }

  try {
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@estpo.com`;
    const password = studentId;

    // Création Auth Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const uid = userRecord.uid;

    // Firestore
    await admin.firestore().collection("users").doc(uid).set({
      id: uid,
      email,
      firstName,
      lastName,
      role: "student",
      studentId,
      ineNumber,
      departmentId: department,
      levelId: level,
      fieldId: specialization,
      dateOfBirth,
      avatar: "",
      phone,
      address,
      nationality,
      emergencyContact,
      emailPersonal,
    });

    return res.status(200).json({ success: true, uid, email });
  } catch (error: any) {
    console.error("Erreur création étudiant:", error);
    return res.status(500).json({ error: error.message || "Failed to create student" });
  }
});

/* -------------------------------
   Récupération des étudiants
   GET /students?department=&field=&level=
--------------------------------- */
router.get("/", async (req, res) => {
  const { department, field, level } = req.query;

  if (!department || !field || !level) {
    return res.status(400).json({
      error: "Filtres requis : department, field, level",
    });
  }

  try {
    const snapshot = await admin
      .firestore()
      .collection("users")
      .where("role", "==", "student")
      .where("departmentId", "==", department)
      .where("fieldId", "==", field)
      .where("levelId", "==", level)
      .get();

    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(students);
  } catch (err: any) {
    console.error("GET /students ERROR:", err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
});

export default router;
