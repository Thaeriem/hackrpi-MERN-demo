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
npx create-react-app hackrpi-demo --template typescript
```
Create basic template for Express & MongoDB/Mongoose implementation (example implementation is included in `final` branch)

## Creating a `.env` file, why is it important?

`.env` files securely store sensitive information for software applications, ensuring separation from the codebase for security and portability.

Add the following `.env` file to your root folder with these considerations: \
`MONGODB_URI`, Follow presentation process to link project to your MongoDB Cluster. \
`JWT_SECRET`, Generate a 128 character hash using https://codebeautify.org/generate-random-string. \
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, You can use the provided ones below or make your own project on Google Cloud Console. 
```shell
JWT_SECRET = 
MONGODB_URI = mongodb+srv://<username>:<password>@collablabdb.4faa3in.mongodb.net/?retryWrites=true&w=majority

GOOGLE_CLIENT_ID = 
GOOGLE_CLIENT_SECRET = 
```