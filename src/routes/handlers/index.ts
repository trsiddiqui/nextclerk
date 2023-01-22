import { NextFunction, Request, Response } from 'express'
import querystring from 'querystring'
import axios from 'axios'

class IndexHandler {
  public index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
}

export default IndexHandler
