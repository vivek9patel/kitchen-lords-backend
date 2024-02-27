import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import KitchenDB from "./firebase/models/Kitchen";
import ChefDB from "./firebase/models/Chef";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

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