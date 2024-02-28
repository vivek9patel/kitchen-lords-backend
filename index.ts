import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import KitchenDB from "./firebase/models/Kitchen";
import ChefDB from "./firebase/models/Chef";
import { checkUserWriteAccess } from "./utils";
import md5 from "md5";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// alow requests from localhost and https://kitchen-lords.vercel.app/
app.options('*', cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Origin', 'https://kitchen-lords.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Kitchen Lords server!");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get("/chef", async (req: Request, res: Response) => {
  if (req.query.id) {
    const chef = ChefDB.getInstanceByID(req.query.id as string);
    const chefData = await chef.get();
    res.send(chefData);
  }
  else if (req.query.email) {
    const chef = ChefDB.getInstance(req.query.email as string);
    const chefData = await chef.get();
    res.send(chefData);
  }
  else {
    res.status(400).send("Missing chef identifier");
    return;
  }
});

app.get("/chef/authorized", async (req: Request, res: Response) => {
  if (req.query.id) {
    const chef = ChefDB.getInstanceByID(req.query.id as string);
    const isAuthorized = await chef.getIsAuthorized();
    res.send({isAuthorized});
  }
  else if (req.query.email) {
    const chef = ChefDB.getInstance(req.query.email as string);
    const isAuthorized = await chef.getIsAuthorized();
    res.send({isAuthorized});
  }
  else {
    res.status(400).send("Missing chef identifier");
    return;
  }
});

app.get("/chef/kitchens", async (req: Request, res: Response) => {
  if (req.query.id) {
    const chef = ChefDB.getInstanceByID(req.query.id as string);
    const kitchens = await chef.getKitchens();
    res.send(kitchens);
  }
  else if (req.query.email) {
    const chef = ChefDB.getInstance(req.query.email as string);
    const kitchens = await chef.getKitchens();
    res.send(kitchens);
  }
  else {
    res.status(400).send("Missing chef identifier");
    return;
  }
});

app.get("/kitchen/chefs", async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).send("Missing kitchen identifier");
    return;
  }
  const kitchen = KitchenDB.getInstance(id);
  const chefs = await kitchen.getAllChefs(id);
  res.send(chefs);
});

app.get("/kitchen/name", async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).send("Missing kitchen identifier");
    return;
  }
  const kitchen = KitchenDB.getInstance(id);
  const kitchenName = await kitchen.getKitchenName();
  res.send(kitchenName);
})

app.get("/kitchen/week", async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).send("Missing kitchen identifier");
    return;
  }
  const kitchen = KitchenDB.getInstance(id);
  const week_json = await kitchen.getWeek();
  res.send(week_json);
})

app.get("/kitchen/day", async (req: Request, res: Response) => {
  const id = req.query.id as string;
  const day = req.query.day as string;
  if (!id) {
    res.status(400).send("Missing kitchen identifier");
    return;
  }
  if (!day) {
    res.status(400).send("Missing day");
    return;
  }
  const kitchen = KitchenDB.getInstance(id);
  const day_json = await kitchen.getDay(day);
  res.send(day_json);
});

app.get("/kitchen/image", async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).send("Missing kitchen identifier");
    return;
  }
  const kitchen = KitchenDB.getInstance(id);
  const imageURL = await kitchen.getKitchenImageURL();
  res.send(imageURL);
});

app.put("/kitchen/day/assign", async (req: Request, res: Response) => {
  const uid = req.body.uid as string;
  const id = req.body.id as string;
  const day = req.body.day as string;
  const chef_id = req.body.chef_id as string;
  const dish_name = req.body.dish_name as string;
  const dish_type = req.body.dish_type as string;
  if (!id) {
    res.status(400).send("Missing kitchen identifier");
    return;
  }
  if (!day) {
    res.status(400).send("Missing day");
    return;
  }
  if (!chef_id) {
    res.status(400).send("Missing chef identifier");
    return;
  }
  if (!dish_name) {
    res.status(400).send("Missing dish name");
    return;
  }
  if (!dish_type) {
    res.status(400).send("Missing dish type");
    return;
  }
  if (dish_type !== 'italian' && dish_type !== 'indian' && dish_type !== 'mexican' && dish_type !== 'other') {
    res.status(400).send("Invalid dish type");
    return;
  }
  
  if(!(await checkUserWriteAccess(uid, chef_id, id))){
    res.status(403).send("Unauthorized");
    return;
  }
  console.log("Loggedin user", uid)
  console.log("Assigning", chef_id, "to", day, "in", id);

  const kitchen = KitchenDB.getInstance(id);
  await kitchen.updateDishAndAssignee(day, dish_name, dish_type, chef_id);
  res.send({success: true});
})

app.put("/kitchen/day/reaction", async (req: Request, res: Response) => {
  const uid = req.body.uid as string;
  const chef_id = req.body.chef_id as string;
  const id = req.body.id as string;
  const day = req.body.day as string;
  const reaction = req.body.reaction as string;
  if (!id) {
    res.status(400).send("Missing kitchen identifier");
    return;
  }
  if (!day) {
    res.status(400).send("Missing day");
    return;
  }
  if (!reaction) {
    res.status(400).send("Missing reaction");
    return;
  }
  if (reaction !== '👎' && reaction !== '👍' && reaction !== '😍' && reaction !== '🥳' && reaction !== '💗' && reaction !== '🤮') {
    res.status(400).send("Invalid reaction");
    return;
  }
  if(!(await checkUserWriteAccess(uid, chef_id, id))){
    res.status(403).send("Unauthorized");
    return;
  }
  console.log("Loggedin user", uid)
  console.log("Reacting", reaction, "to", day, "in", id, "by", chef_id);

  const kitchen = KitchenDB.getInstance(id);
  await kitchen.updateReaction(day, md5(chef_id), reaction);
  res.send({success: true});
})