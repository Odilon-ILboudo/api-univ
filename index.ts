/*import * as functions from "firebase-functions";
import express from "express";
import * as admin from "firebase-admin";
import cors from "cors";

import academicYearRoutes from "./routes/academicYear";
import gradesRoutes from "./routes/grades";
import classCourseRoutes from "./routes/classCourseRoutes";
import courseRouter from "./routes/courses";
import professorsRouter from "./routes/createProfessor";
import studentRoutes from "./routes/createStudentAccount"; 


admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Enregistrer les routes
app.use("/academic-year", academicYearRoutes);
app.use("/class-courses", classCourseRoutes);
app.use("/courses", courseRouter);
app.use("/professors", professorsRouter);
app.use("/students", studentRoutes); 
app.use("/grades", gradesRoutes);


// Exporter l’API Firebase
exports.api = functions.https.onRequest(app);
**/


import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import admin from "./firebaseAdmin";
import academicYearRoutes from "./routes/academicYear";
import gradesRoutes from "./routes/grades";
import classCourseRoutes from "./routes/classCourseRoutes";
import courseRouter from "./routes/courses";
import professorsRouter from "./routes/createProfessor";
import studentRoutes from "./routes/createStudentAccount";

dotenv.config();

// Initialiser Firebase Admin si ce n’est pas déjà fait
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(cors());
app.use(express.json());

// Routes (même logique que Firebase)
app.use("/api/academic-year", academicYearRoutes);
app.use("/api/class-courses", classCourseRoutes);
app.use("/api/courses", courseRouter);
app.use("/api/professors", professorsRouter);
app.use("/api/students", studentRoutes);
app.use("/api/grades", gradesRoutes);

// Exporter la fonction serverless pour Vercel
export default (req: Request, res: Response) => {
  app(req, res);
};
