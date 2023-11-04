import express from "express";
import mongoose from "mongoose";
import compression from "compression";
import cors from "cors";
import { MONGODB_URI } from "./util/secrets";
import { AccountRoutes } from "./routes/accountRoutes";
import { DataRoutes } from "./routes/dataRoutes";

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.mongo();
  }

  public routes(): void {
    this.app.use("/api/auth", new AccountRoutes().router);
    this.app.use("/api/data", new DataRoutes().router);
    // health check protocol
    this.app.get("/", (req, res) => res.send({ status: "I'm alive!" }));
  }

  public config(): void {
    this.app.set("port", process.env.PORT || 3000);
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
  }

  private mongo() {
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("Mongo Connection Established");
    });
    connection.on("reconnected", () => {
      console.log("Mongo Connection Reestablished");
    });
    connection.on("disconnected", () => {
      console.log("Mongo Connection Disconnected");
      console.log("Trying to reconnect to Mongo ...");
      setTimeout(() => {
        mongoose.connect(MONGODB_URI, {
          socketTimeoutMS: 3000,
          connectTimeoutMS: 3000,
          useNewUrlParser: true,
          useFindAndModify: false,
          useUnifiedTopology: true,
          useCreateIndex: true,
          keepAlive: true,
        });
      }, 3000);
    });
    connection.on("close", () => {
      console.log("Mongo Connection Closed");
    });
    connection.on("error", (error: Error) => {
      console.log("Mongo Connection ERROR: " + error);
    });

    const run = async () => {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
        keepAlive: true,
      });
    };
    run().catch((error) => console.error(error));
  }

  public start(): void {
    this.app.listen(this.app.get("port"), () => {
      console.log("API is running on port:%d", this.app.get("port"));
    });
  }
}

const server = new Server();

server.start();
