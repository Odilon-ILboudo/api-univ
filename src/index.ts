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




/*
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
*/


/*
// src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import admin from "./firebaseAdmin";
import academicYearRoutes from "./src/routes/academicYear";
import gradesRoutes from "./src/routes/grades";
import classCourseRoutes from "./src/routes/classCourseRoutes";
import courseRouter from "./src/routes/courses";
import professorsRouter from "./src/routes/createProfessor";
import studentRoutes from "./src/routes/createStudentAccount";

dotenv.config();

if (!admin.apps.length) admin.initializeApp();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/academic-year", academicYearRoutes);
app.use("/api/class-courses", classCourseRoutes);
app.use("/api/courses", courseRouter);
app.use("/api/professors", professorsRouter);
app.use("/api/students", studentRoutes);
app.use("/api/grades", gradesRoutes);

// Exporter pour Vercel Serverless
export default app;
*/



import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import admin from "./firebaseAdmin";

// Routes
import academicYearRoutes from "./routes/academicYear";
import gradesRoutes from "./routes/grades";
import classCourseRoutes from "./routes/classCourseRoutes";
import courseRouter from "./routes/courses";
import professorsRouter from "./routes/createProfessor";
import studentRoutes from "./routes/createStudentAccount";
import departmentsRoutes from "./routes/departmentsRoutes";
import welcomeEmailRoute from "./routes/sendWelcomeEmail";
import scheduleRoute from "./routes/schedule";

dotenv.config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(cors());
app.use(express.json());

// --- API ROUTES ---

//app.use("/api/class-courses", classCourseRoutes);


app.use("/api", departmentsRoutes);
app.use("/api/students", studentRoutes);
app.use("/api", welcomeEmailRoute);
app.use("/api/professors", professorsRouter);
app.use("/api/courses", courseRouter);
app.use("/api", scheduleRoute); 
app.use("/api/grades", gradesRoutes);
app.use("/api/academic-year", academicYearRoutes);

// --- REQUIRED EXPORT FOR VERCEL SERVERLESS ---
import { VercelRequest, VercelResponse } from "@vercel/node";

export default (req: VercelRequest, res: VercelResponse) => {
  app(req as any, res as any);
};
