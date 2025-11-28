// api/departmentsRoutes.ts
import express from "express";
import admin from "../../firebaseAdmin";

const router = express.Router();
const db = admin.firestore();

/* -----------------------------------
   TYPES EXACTS (frontend compatible)
------------------------------------ */
export interface Level {
  id: string; 
  name: string;
}

export interface Field {
  id: string;
  name: string;
  levels: Level[];
}

export interface Department {
  id: string;
  name: string;
  fields: Field[];
}

/* -----------------------------------
   GET ALL : departments > fields > levels
------------------------------------ */
router.get("/departments", async (req, res) => {
  try {
    const snapshot = await db.collection("departments").orderBy("name").get();

    const departments: Department[] = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as Partial<Department> | undefined;

        const dept: Department = {
          id: doc.id,
          name: data?.name ?? "Sans nom",
          fields: [],
        };

        const fieldsSnap = await db
          .collection("departments")
          .doc(doc.id)
          .collection("fields")
          .orderBy("name")
          .get();

        dept.fields = await Promise.all(
          fieldsSnap.docs.map(async (f) => {
            const fData = f.data() as Partial<Field> | undefined;

            const field: Field = {
              id: f.id,
              name: fData?.name ?? "Sans nom",
              levels: [],
            };

            const levelsSnap = await db
              .collection("departments")
              .doc(doc.id)
              .collection("fields")
              .doc(f.id)
              .collection("levels")
              .orderBy("name")
              .get();

            field.levels = levelsSnap.docs.map((l) => ({
              id: l.id,
              name: (l.data() as Partial<Level>)?.name ?? "Sans nom",
            }));

            return field;
          })
        );

        return dept;
      })
    );

    return res.json(departments); // ✅ ajout du return
  } catch (err) {
    console.error("GET /departments ERROR :", err);
    return res.status(500).json({ error: "Erreur serveur" }); // ✅ ajout du return
  }
});

/* -----------------------------------
   DEPARTMENTS CRUD
------------------------------------ */
// CREATE department
router.post("/departments", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name requis" });

  try {
    const ref = await db.collection("departments").add({
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({ success: true, id: ref.id }); // ✅ return ajouté
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" }); // ✅ return ajouté
  }
});

// UPDATE department
router.put("/departments/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await db.collection("departments").doc(id).update({ name });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE department + children
router.delete("/departments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const fieldsSnap = await db.collection("departments").doc(id).collection("fields").get();
    const batch = db.batch();

    for (const f of fieldsSnap.docs) {
      const levelsSnap = await f.ref.collection("levels").get();
      levelsSnap.docs.forEach((lvl) => batch.delete(lvl.ref));
      batch.delete(f.ref);
    }

    await batch.commit();
    await db.collection("departments").doc(id).delete();

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -----------------------------------
   FIELDS CRUD
------------------------------------ */
router.post("/departments/:deptId/fields", async (req, res) => {
  const { name } = req.body;
  const { deptId } = req.params;

  try {
    const ref = await db
      .collection("departments")
      .doc(deptId)
      .collection("fields")
      .add({
        name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    return res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/departments/:deptId/fields/:fieldId", async (req, res) => {
  const { deptId, fieldId } = req.params;
  const { name } = req.body;

  try {
    await db.collection("departments").doc(deptId).collection("fields").doc(fieldId).update({ name });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/departments/:deptId/fields/:fieldId", async (req, res) => {
  const { deptId, fieldId } = req.params;

  try {
    const levelsSnap = await db.collection("departments").doc(deptId).collection("fields").doc(fieldId).collection("levels").get();
    const batch = db.batch();
    levelsSnap.docs.forEach((lvl) => batch.delete(lvl.ref));
    batch.delete(db.collection("departments").doc(deptId).collection("fields").doc(fieldId));

    await batch.commit();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -----------------------------------
   LEVELS CRUD
------------------------------------ */
router.post("/departments/:deptId/fields/:fieldId/levels", async (req, res) => {
  const { name } = req.body;
  const { deptId, fieldId } = req.params;

  try {
    const ref = await db.collection("departments").doc(deptId).collection("fields").doc(fieldId).collection("levels").add({
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/departments/:deptId/fields/:fieldId/levels/:levelId", async (req, res) => {
  const { name } = req.body;
  const { deptId, fieldId, levelId } = req.params;

  try {
    await db.collection("departments").doc(deptId).collection("fields").doc(fieldId).collection("levels").doc(levelId).update({ name });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/departments/:deptId/fields/:fieldId/levels/:levelId", async (req, res) => {
  const { deptId, fieldId, levelId } = req.params;

  try {
    await db.collection("departments").doc(deptId).collection("fields").doc(fieldId).collection("levels").doc(levelId).delete();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
