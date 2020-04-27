import express from "express";

const router = express.Router();

router.post("/instagram", (_, res) => {
  res.json({ok: true});
});

export default router;
