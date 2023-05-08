import express, { Router } from "express";
import path from "path";

// Routes
import apiRouter from "./api";

const router = Router();

const adminRouter = Router();

adminRouter.use(
    express.static(path.join(__dirname + "/../../../admin/build"), {
        redirect: false,
    })
);

adminRouter.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/../../../admin/build/index.html"));
});

router.use("/admin", adminRouter);
router.use("/api", apiRouter);

export default router;
