import Router from 'express-promise-router';
import { verify, create } from '../controllers/orders';

const router = Router();

router.get('/verify', verify);
router.post('/', create);

export default router;
