import Router from 'express-promise-router';
import { ping } from '../controllers/healthCheck';

const router = Router();

router.get('/health', ping);

export default router;
