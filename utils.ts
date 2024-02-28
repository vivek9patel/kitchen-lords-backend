import ChefDB from "./firebase/models/Chef";

export async function checkUserWriteAccess(uid: string, toEditChefId: string, kitchen_id: string): Promise<boolean>{
    const loggedInUser = await ChefDB.getInstance(uid).get();
    if(loggedInUser.is_god) return true;

    if (uid !== toEditChefId) {
        return false;
    }
    
    const kitchenWriteAccess = loggedInUser.kitchens[kitchen_id] && loggedInUser.kitchens[kitchen_id].is_admin;

    if (!loggedInUser || !loggedInUser.has_access || !kitchenWriteAccess) {
        return false;
    }

    return true;
}