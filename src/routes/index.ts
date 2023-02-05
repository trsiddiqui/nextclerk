import { Router } from 'express';
import IndexHandler from '../routes/handlers';
import { Routes } from '../interfaces/routes.interface';

class IndexRoute implements Routes {
  public router = Router();
  public indexHandler = new IndexHandler();

  constructor() {
    this.router.get(`/`, this.indexHandler.index);
  }
}

export default IndexRoute;
