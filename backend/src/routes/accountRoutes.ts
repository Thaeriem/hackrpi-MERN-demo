import { Router } from "express";
import { AccountController, authGoogle, receiveGoogle } from "../controllers/accountController";
import { AuthController } from "../controllers/authController";

export class AccountRoutes {
  router: Router;
  public accountController: AccountController = new AccountController();
  public authController: AuthController = new AuthController();

  constructor() {
    this.router = Router();
    this.routes();
  }
  routes() {
    this.router.post("/register", this.accountController.registerAccount);
    this.router.post("/login", this.accountController.authAccount);
    this.router.get("/google", authGoogle);
    this.router.get("/google/callback", receiveGoogle);
  }
}
