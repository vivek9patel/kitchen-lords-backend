import {getFirebaseDB} from '../index';
import { ref, Database, get, set } from "firebase/database";
import { Chef, Kitchens } from '../types';
import md5 from 'md5';
export default class ChefDB{
    private static _instance: ChefDB | null = null;
    private db: Database;
    private root: string;
    
    constructor(chef_email: string){
        this.db = getFirebaseDB();
        this.root = `chef/${md5(chef_email)}`;
    }

    public static getInstance(chef_email: string): ChefDB{
        if (!ChefDB._instance) {
            ChefDB._instance = new ChefDB(chef_email);
        }
        ChefDB._instance.setEmail(chef_email);
        return ChefDB._instance;
    }

    public static getInstanceByID(chef_id: string): ChefDB{
        if (!ChefDB._instance) {
            ChefDB._instance = new ChefDB(chef_id);
        }
        ChefDB._instance.root = `chef/${chef_id}`;
        return ChefDB._instance;
    }

    public async get(): Promise<Chef>{
        const snapshot = await get(ref(this.db,`${this.root}`));
        return snapshot.val() || {
            email: "",
            name: "",
            kitchens: {},
            is_god: false,
            has_access: false,
        };
    }

    public async getName(): Promise<string>{
        const snapshot = await get(ref(this.db,`${this.root}/name`));
        return snapshot.val();
    }

    public async getIsGod(): Promise<boolean>{
        const snapshot = await get(ref(this.db,`${this.root}/is_god`));
        return snapshot.val() || false;
    }

    public async getKitchens(): Promise<Kitchens>{
        const snapshot = await get(ref(this.db,`${this.root}/kitchens`));
        return snapshot.val() || {};
    }

    public async getIsAuthorized(): Promise<boolean>{
        const snapshot = await get(ref(this.db,`${this.root}/has_access`));
        return snapshot.val() || false;
    }

    private setEmail(chef_email: string){
        this.root = `chef/${md5(chef_email)}`;
    }

}

export async function createChef(chef_email: string, chef_name: string): Promise<ChefDB>{
    const chefRef = ref(getFirebaseDB(), `chef/${chef_email}`);
    await set(chefRef, {
        email: chef_email,
        name: chef_name,
        kitchens: {},
        is_god: false
    });
    return ChefDB.getInstance(chef_email);
}