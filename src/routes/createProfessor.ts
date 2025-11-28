// api/routes/professors.ts
import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import admin from "../../firebaseAdmin";

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY!);

/* -------------------------------
   Création d'un professeur
--------------------------------- */
router.post("/", async (req, res) => {
  const {
    firstName,
    lastName,
    professorId,
    email: personalEmail,
    phone,
    department,
    field,
    level,
  } = req.body;

  if (!firstName || !lastName || !professorId || !personalEmail) {
    return res.status(400).json({
      error: "Prénom, nom, identifiant et email personnel obligatoires",
    });
  }

  try {
    const institutionalEmail = `${firstName.toLowerCase()}.${lastName
      .toLowerCase()
      .replace(/\s+/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")}@estpo.com`;

    const password = professorId;

    // Création Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: institutionalEmail,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const uid = userRecord.uid;

    // Firestore
    await admin.firestore().collection("users").doc(uid).set({
      id: uid,
      firstName,
      lastName,
      emailInstitutional: institutionalEmail,
      personalEmail,
      professorId,
      phone: phone || "",
      department: department || "",
      field: field || "",
      level: level || "",
      role: "teacher",
    });

    // Envoi du mail via Resend
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: personalEmail,
      subject: "Bienvenue à ESTPO ! Votre compte professeur",
      text: `
Bonjour ${firstName},

Bienvenue à l'École Supérieure des Travaux Publics de Ouagadougou 🎓

Voici vos identifiants de connexion :

  • Email institutionnel : ${institutionalEmail}
  • Mot de passe : ${password}

Connectez-vous ici :
https://portal.estpo.com/login

Support : support@estpo.com

Bonne année académique !
L'équipe ESTPO
      `,
    });

    return res.status(200).json({
      success: true,
      uid,
      email: institutionalEmail,
      personalEmail,
    });
  } catch (err: any) {
    console.error("Erreur création professeur:", err);
    return res.status(500).json({ error: err.message || "Failed to create professor" });
  }
});

/* -------------------------------
   Récupération de tous les professeurs
--------------------------------- */
router.get("/", async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("users")
      .where("role", "==", "teacher")
      .get();

    const professors = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.emailInstitutional,
        department: data.department,
        field: data.field,
        level: data.level,
      };
    });

    return res.status(200).json(professors);
  } catch (err: any) {
    console.error("Erreur récupération professeurs:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch professors" });
  }
});

export default router;
