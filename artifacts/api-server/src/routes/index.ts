import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import notificationRouter from "./notifications";
import airtimeRouter from "./airtime";
import giftCardsRouter from "./gift-cards";
import utilitiesRouter from "./utilities";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(notificationRouter);
router.use(airtimeRouter);
router.use(giftCardsRouter);
router.use(utilitiesRouter);

export default router;
