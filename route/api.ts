import Router from 'koa-router';
import userController from '../controller/api/user';
import signController from '../controller/api/signin';
import screenController from '../controller/api/screen';

const router = new Router();

router.get('/user', userController.getUser);
router.post('/signin', signController.postSignIn);
router.get('/fullScreenshot', screenController.getFullScreenShot);

export default router;
