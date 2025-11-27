// api/sendWelcomeEmail.ts
import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config(); // <-- Ajouté

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY!);

router.post("/send-welcome-email", async (req, res) => {
  const { firstName, emailPersonal, email, studentId } = req.body;

  if (!firstName || !emailPersonal || !email || !studentId) {
    return res.status(400).json({ error: "Missing parameters" });
  }
 
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: emailPersonal,
      subject: "Bienvenue à ESTPO ! Vos identifiants",
      text: `
Bonjour ${firstName},

Félicitations et bienvenue à l'École Supérieure des Travaux Publics de Ouagadougou 🎓

Voici vos identifiants de connexion :

  • Email : ${email}
  • Mot de passe : ${studentId}

Connectez-vous ici :
https://portal.estpo.com/login

Support : support@estpo.com

Bonne année académique !
L'équipe ESTPO
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur envoi email:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
