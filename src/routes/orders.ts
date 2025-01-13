import Router from "express-promise-router";
import { verify } from "../controllers/orders";

const router = Router();

router.get('/verify', verify);

export default router;
