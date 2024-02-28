import { initializeApp} from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import dotenv from "dotenv";

dotenv.config();

const app = initializeApp({
  "apiKey": process.env.API_KEY,
  "authDomain": process.env.AUTH_DOMAIN,
  "projectId": process.env.PROJECT_ID,
  "storageBucket": process.env.STORAGE_BUCKET,
  "messagingSenderId": process.env.MESSAGING_SENDER_ID,
  "appId": process.env.APP_ID
});


let dbInstance: Database | null = null;

export const getFirebaseDB = (): Database => {
  if (!dbInstance) {
    console.log('Creating new db instance');
    dbInstance = getDatabase(app);
  }
  else {
    console.log('Using existing db instance');
  }
  return dbInstance;
};

export default app;