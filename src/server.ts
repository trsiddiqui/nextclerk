import App from '@/app'
import IndexRoute from '@/routes'
import UsersRoute from '@/routes/users'
import validateEnv from '@utils/validateEnv'
import SupportingPackagesRoute from './routes/supportingPackage'

validateEnv()

const app = new App([new IndexRoute(), new UsersRoute(), new SupportingPackagesRoute()])

app.listen()
