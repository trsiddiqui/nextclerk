import { Router } from 'express'
import UsersHandler from '@/routes/handlers/users'
import { Routes } from '@interfaces/routes.interface'
import { openApiValidatorMiddlewares } from './middlewares/validation'

class UsersRoute implements Routes {
  public router = Router()
  usersController = new UsersHandler()
  public path = 'users-api'

  constructor() {
    // this.router.use(
    //   ...openApiValidatorMiddlewares({
    //     apiSpec: 'swagger.yaml',
    //     validateResponses: true, // this should take care of the responses in tests
    //   }),
    // );
    this.router.get(`/users`, this.usersController.getUsers)
    this.router.get(`/users/:id`, this.usersController.getUserById)
    this.router.post(`/users`, this.usersController.createUser)
    this.router.put(`/users/:id`, this.usersController.updateUser)
    this.router.delete(`/users/:id`, this.usersController.deleteUser)
  }
}

export default UsersRoute
