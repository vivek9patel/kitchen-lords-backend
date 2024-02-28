import ChefDB from "./firebase/models/Chef";

export async function checkUserWriteAccess(uid: string, chef_id: string, kitchen_id: string): Promise<boolean>{
    const chef = await ChefDB.getInstance(chef_id).get();
    if(chef.is_god) return true;

    if (uid !== chef_id) {
        return false;
    }
    
    const kitchenWriteAccess = chef.kitchens[kitchen_id] && chef.kitchens[kitchen_id].is_admin;

    if (!chef || !chef.has_access || !kitchenWriteAccess) {
        return false;
    }

    return true;
}