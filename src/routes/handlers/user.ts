import { NextFunction, Request, Response } from 'express'
import { User } from '@/types/user'
import userService from '@services/user.service'
import { $EntityService, $UserService } from '@services/index'
import { $UserManager } from '@/models'

class UsersHandler {
  public userService = new userService({ userManager: $UserManager, entityService: $EntityService })

  public getEntityUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { customerXRefID } = req.params
      const entityUsers = await $UserService.getEntitiesUsers({
        customerXRefID,
      })

      res.status(200).json(entityUsers)
    } catch (error) {
      next(error)
    }
  }
}

export default UsersHandler
