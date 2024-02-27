export type Kitchens = {
    [kitchen_id: string]: {
        position: string;
        is_admin: boolean;
    };
}

export type Chef = {
    email: string;
    name: string;
    url: string;
    kitchens: Kitchens;
    is_god: boolean;
    has_access: boolean;
};

export type Week = {
    monday: Day;
    tuesday: Day;
    wednesday: Day;
    thursday: Day;
    friday: Day;
    saturday: Day;
    sunday: Day;
};

export type Day = {
    day: string;
    chef_id: string;
    comments: {
        [chef_id: string]: string;
    };
    reactions: {
        [chef_id: string]: Reaction;
    };
    dish_style: DishType;
    dish_name: string;
};

export type Kitchen = {
    name: string;
    week: Week;
    image_url: string;
};

export type Reaction = '👎' | '👍' | '😍' | '🥳' | '💗';

export type DishType = 'italian' | 'indian' | 'mexican' | 'gujarati' | 'punjabi' | 'other';