import App from '@/app';
import IndexRoute from '@/routes';
import UsersRoute from '@/routes/users';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute()]);

app.listen();
