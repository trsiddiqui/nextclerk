import App from '@/app';
import AuthRoute from '@/routes/auth';
import IndexRoute from '@/routes';
import UsersRoute from '@/routes/users';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute()]);

app.listen();
