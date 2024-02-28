import {getFirebaseDB} from '../index';
import { ref, update, Database, get, set } from "firebase/database";
import { DishType, Reaction, Kitchen, Day, Chef } from '../types';
import {DEFAULT_KITCHEN_SCHEMA} from "../constants";
import md5 from 'md5';

export default  class KitchenDB{
    private static _instance: KitchenDB | null = null;
    kitchenID: string;
    private db: Database;
    private root: string;

    constructor(kitchenID: string){
        this.db = getFirebaseDB();
        this.kitchenID = kitchenID;
        this.root = `kitchen/${kitchenID}`;
    }

    public static getInstance(kitchenID: string): KitchenDB{
        if (!KitchenDB._instance) {
            KitchenDB._instance = new KitchenDB(kitchenID);
          }
          KitchenDB._instance.setId(kitchenID);
          return KitchenDB._instance;
    }

    // get methods
    public async getKitchenName(){
        const snapshot = await get(ref(this.db,`${this.root}/name`));
        return snapshot.val();
    }

    public async getKitchenImageURL(){
        const snapshot = await get(ref(this.db,`${this.root}/image_url`));
        return snapshot.val();
    }

    public async getWeek(){
        const snapshot = await get(ref(this.db,`${this.root}/week`));
        return snapshot.val() || {};
    }

    public async getDay(day: string): Promise<Day>{
        const snapshot = await get(ref(this.db,`${this.root}/week/${day}`));
        return snapshot.val() || {
            day: day,
            chef_id: "",
            comments: {},
            reactions: {},
            dish_style: "",
            dish_name: ""
        };
    }

    public async getAllChefs(kitchenID: string): Promise<Chef[]>{
        const snapshot = await get(ref(this.db,`chef`));
        const allChefs = snapshot.val() as {
            [chef_id: string]: Chef;
        };
        const thisKitchenChefs: Chef[] = [];
        for (const chef_id in allChefs) {
            if (allChefs[chef_id].kitchens[kitchenID] ) {
                thisKitchenChefs.push(allChefs[chef_id]);
            }
        }
        return thisKitchenChefs;
    }

    // update methods
    public async updateKitchenName(name: string){
        await update(ref(this.db,`${this.root}`), {name: name});
    }

    public async updateAssignee(day: string, chef_id: string){
        await update(ref(this.db,`${this.root}/week/${day}`), {chef_id: chef_id});
    }

    public async updateReaction(day: string, chef_id: string, reaction: Reaction){
        await update(ref(this.db,`${this.root}/week/${day}/reactions`), {[chef_id]: reaction});
    }

    public async updateComment(day: string, chef_id: string, comment: string){
        await update(ref(this.db,`${this.root}/week/${day}/comments`), {[chef_id]: comment});
    }

    public async updateDishName(day: string, dish_name: string){
        await update(ref(this.db,`${this.root}/week/${day}`), {dish_name: dish_name});
    }

    public async updateDishStyle(day: string, dish_style: DishType){
        await update(ref(this.db,`${this.root}/week/${day}`), {dish_style: dish_style});
    }

    public async updateDishAndAssignee(day: string, dish_name: string, dish_style: DishType, chef_id: string){
        await update(ref(this.db,`${this.root}/week/${day}`), {dish_name: dish_name, dish_style: dish_style, chef_id: chef_id});
    }

    // delete methods
    public async removeAssignee(day: string){
        await update(ref(this.db,`${this.root}/week/${day}`), {chef_id: null});
    }

    public async removeReaction(day: string, chef_id: string){
        await update(ref(this.db,`${this.root}/week/${day}/reactions`), {[chef_id]: null});
    }

    public async removeComment(day: string, chef_id: string){
        await update(ref(this.db,`${this.root}/week/${day}/comments`), {[chef_id]: null});
    }

    public async removeDish(day: string){
        await update(ref(this.db,`${this.root}/week/${day}`), {dish_name: null, dish_style: null, chef_id: null});
    }

    public setId(kitchenID: string){
        this.kitchenID = kitchenID;
        this.root = `kitchen/${kitchenID}`;
    }
}

export async function createKitchen(kitchenID: string, kitchenName: string){
    const kitchenRef = ref(getFirebaseDB(), `kitchen/${kitchenID}`);
    const kitchenData: Kitchen = {
        ...DEFAULT_KITCHEN_SCHEMA,
        name: kitchenName
    }
    await set(kitchenRef, kitchenData);
    return KitchenDB.getInstance(kitchenID);
}