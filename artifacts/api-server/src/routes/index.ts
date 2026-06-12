import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import notificationRouter from "./notifications";
import airtimeRouter from "./airtime";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(notificationRouter);
router.use(airtimeRouter);

export default router;
