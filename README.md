# hackrpi-MERN-demo

## Prerequisites 

- Integrated Development Environment
    - Have an IDE of your choice installed (my personal choice is Visual Studio Code)
- Node.js and NPM (Linux/Mac/Windows)
    - https://nodejs.org/en/download
    - verify your install using `node -v` and `npm -v`
- MongoDB Account, Organization, Cluster/Database
    - https://www.mongodb.com/cloud/atlas/register
    - Check presentation slides for Organization and Cluster/Database

## Getting Started

The following steps have already been completed for you but are listed in case you want to learn about building the project from scratch. 

Initializing the React application:  
```console
npm create vite@latest frontend --template react-js
```
Create basic template for Express & MongoDB/Mongoose implementation (example implementation is included in `final` branch)

## Creating an `.env` file, why is it important?

`.env` files securely store sensitive information for software applications, ensuring separation from the codebase for security and portability.

Add the following `.env` file to your root folder with these considerations: \
`MONGODB_URI`, Follow presentation process to link project to your MongoDB Cluster. \
`JWT_SECRET`, Generate a 128 character hash using https://codebeautify.org/generate-random-string. \
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, You can use the provided ones below or make your own project on Google Cloud Console. 
> [!IMPORTANT]
> Never commit your `.env` file to any repository as this will expose your authentication keys and potentially compromise your or other's sensitive information


```yaml
JWT_SECRET = [Add 128 character hash here]
MONGODB_URI = mongodb+srv://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
GOOGLE_CLIENT_ID = 597392536070-9gsi2fgio9p2lbir4ildr4jsfkkqiovv.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
```

## TypeScript Backend API's: An Overview

> [!NOTE]
> This demo will go over how to create basic API's with some security considerations but real world development often uses more/other protocols that are not in scope for this presentation.

### Folder Structure
```
|- backend
  |- auth
    |- passportHandler.ts
  |- controllers
    |- accountController.ts
    |- authController.ts
    |- dataController.ts
  |- models
    |- account.ts
    |- data.ts
  |- routes
    |- accountRoutes.ts
    |- dataRoutes.ts
  |- util
    |- secrets.ts
  |- server.ts
  |- [more configs...]
```

### Getting Started: Models

Database models help describe the logical structure of a database and ensure that all the data follows some predefined schema. 
Essentially, we define a structure for data that we want to store in a database, and ensure that our system can always assume that the data follows that format. 

For this demo, we have two predefined models. Let's look at one of them, `account.ts`!

```typescript
export interface IAccount extends Document {
  username: string;
  password: string;
  salt: string;
  email: string;
  displayName: string;
}
```
As you can see, we define an interface `IAccount` that follows the preset `Document` definition in MongoDB. For our model, we define some variables that we want to store in the database such as username, password, salt? (we will learn what this is later), email, and their displayName.

You might be wondering, "Great! But how do we even use this thing?". 

### Using Models: Controllers

Functions that are allowed to directly interface with MongoDB are inherently dangerous. With a connection string to the database, they are essentially granted free reign to add, delete, and change any data. Because of this, we want these functions to handle all cases that our API might face (such as what happens if the request is ill defined, shouldnt have access to the database, or if the data they are requesting doesn't exist).

Let's look at an example controller function: `registerAccount`.
```typescript
public async registerAccount(req: Request, res: Response): Promise<void> {
    const template = { username: "", password: "", email: "", displayName: "" };
    if (!validateInputs(req.body, template)) {
      res.status(400).json({ status: "error", code: "invalid fields" });
      return;
    }
    const valid = await checkValidAccount(
      req.body.username as string,
      req.body.email as string
    );

    if (valid) {
      res.status(400).json({ status: "error", code: "invalid request" });
      return;
    }
    const token = await createAccount(req.body);
    res.status(201).send({ token: token });
  }
```
We have a prewritten input validator that checks our incoming HTTP Request to see if it matches the format our controller expects. Next, we use `await checkValidAccount()` to query the database and see if a user already exists with either the given username or email. If we found a user in the database, then this request is invalid as you cannot register for an account if you already have one. Otherwise, we will run `await createAccount()` with the incoming request information and create a new user in the database. You might have noticed that we send something called a `token` in our response. Keep it in mind for later!

Alright, now we have our functions that interface with MongoDB implemented... But how are we going to call our API?

### Using Controllers: Routers

Routers are the building blocks of modern RESTful API development. They are what let us define what API requests are valid and what kinds of input information should be allowed. 

```typescript
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
```

We define which endpoint definitions our router accepts in our `routes()` functionality. From above, we define POST request routes for registering and logging into a given account, and GET requests for our Google Oauth endpoints (discussed in the Oauth/Security section). There are also PUT requests that define updating information that is already inside the database. 

Great! We have now defined endpoints for our controllers and our database is now theoretically useable for interfacing with MongoDB. Now all we need is a server to run our API's...

### Using Routers: Servers (and Secrets)

We want to programmatically store our secrets from our `.env` file in our code under similar keywords. One approach that was used for the demo is shown below:

```typescript
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const MONGODB_URI = process.env.MONGODB_URI as string;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
```

We want to initalize our server below (and build our service in such a way that we could containerize it in the future to deploy as a micro service on the cloud [if none of these words make any sense, take a look at the Container/Extra Topics section]).

Lets look at some snippets from the demo and discuss their relevance!

```typescript
class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.mongo();
  }
```
We use Express in order to create a server to run our API, and define some sections for configs, routes, and initializing our MongoDB connection.

```typescript
  public routes(): void {
    this.app.use("/api/auth", new AccountRoutes().router);
    this.app.use("/api/data", new DataRoutes().router);
    // health check protocol
    this.app.get("/", (req, res) => res.send({ status: "I'm alive!" }));
  }
```
We define the routes for our Routers that we discussed earlier and provide them unique relative paths for our API request definitions.

```typescript
  public config(): void {
    this.app.set("port", process.env.PORT || 3000);
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
  }
```
These configs allow our server to listen to requests on port 3000 and allow for something called the CORS (Cross-Origin Resource Sharing) policy to be enabled. You can learn more at: https://aws.amazon.com/what-is/cross-origin-resource-sharing/
```typescript
  private mongo() {
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("Mongo Connection Established");
    });
    connection.on("reconnected", () => {
      console.log("Mongo Connection Reestablished");
    });
   [Extra Code Here]...
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
```
This connects our server to our MongoDB cluster, allowing for our controllers to create a connection with the server that will persist for as long as we are running our Express server. 

Looks like we are done!

### All together: Running our server!!!

Now that all the pieces are in place, we can try running our backend service.

First, let us install all the neccesary `npm` packages:
```console
cd backend
npm i
```
Now we can try running the command: 
```console
npm run start
```
which will lint, build, and run our server at `http://localhost:3000/`.
If your terminal prints out:
```console
API is running on port:3000
Mongo Connection Established
```
then the server has ran successfully !!

## Frontend 

### Introduction

As this demo is much more focused on the implementation of API's for MongoDB and other features like Google Oauth/auth tokens, we will briefly cover how React works and then run the provided code.

React is a popular JavaScript library for building user interfaces, particularly for single-page applications where the UI needs to be dynamic and interactive.

Components are the building blocks of a React application. They represent UI elements, and they can be small (like buttons or input fields) or more complex (like forms or entire sections of a webpage). They are designed to be reusable and easily customizable.

State is a way to manage data within a component. It represents the internal state of a component and can change over time in response to user interactions or other events.

React Router is a popular library for implementing navigation in a single-page application. It allows you to define different routes and render different components based on the current URL.

This is pretty much all you need to know for you to look at the demo, but if you are interested you can learn more at: https://react.dev/reference/react

### Running the frontend!!!

Like we did for backend, let us install all the necessary `npm` packages to run our frontend:
```console
cd frontend
npm i
```
Once we have done that, we can now run:
```console
npm run dev
```
to run our frontend. If this works successfuly, the application should open up in the browser!!

## Google Oauth/Security

Google OAuth is a standard protocol that allows users to grant limited access to their Google accounts to third-party applications. It works by redirecting users to Google's authentication page, where they can grant specific permissions. Once granted, Google sends an authorization code to the application, which can be exchanged for access tokens. These tokens allow the application to access the user's Google resources within the granted scope.

On the other hand, JWT (JSON Web Tokens) tokens are a compact, self-contained format for securely transmitting information between parties as a JSON object. In authentication scenarios, JWTs are often used to encode claims about a user, like their ID, roles, and permissions. These tokens are generated by the server upon successful authentication and are included in subsequent requests to identify and authorize the user. 

## Containers & the Cloud

Dockerizing an API involves encapsulating the application, its dependencies, and the environment settings into a container using Docker. A Dockerfile is used to specify the base image and instructions for building the container. This enables consistent deployment across different environments. Once containerized, the API can run anywhere that Docker is installed.

Amazon Web Services (AWS) provides a cloud computing platform that offers a wide range of services, including container orchestration through Amazon Elastic Container Service (ECS) and Amazon Elastic Kubernetes Service (EKS). ECS is a managed container service that simplifies the deployment of Docker containers, while EKS is a managed Kubernetes service that automates the management of containerized applications.

These are just the basics and there are a bunch of options for deployment available on AWS, Azure and GCP (Google Cloud Platform).




