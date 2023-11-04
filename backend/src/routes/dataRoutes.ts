import { Router } from "express";
import { DataController } from "../controllers/dataController";
import { AuthController } from "../controllers/authController";

export class DataRoutes {
  public router: Router;
  public dataController: DataController = new DataController();
  public authController: AuthController = new AuthController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get("/", this.dataController.getAllData);
    this.router.get("/:id", this.dataController.getData);
    this.router.post("/", this.authController.authenticateJWT, this.dataController.createData);
    this.router.put("/:id", this.authController.authenticateJWT, this.dataController.updateData);
    this.router.delete("/:id", this.authController.authenticateJWT, this.dataController.deleteData);
  }
}
