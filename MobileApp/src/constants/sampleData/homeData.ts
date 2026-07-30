export type JourneyItem = {
    id: string;
    age: string;
    title: string;
    description: string;
    colorMonth: string;
};

export type ExpertItem = {
    id: string;
    name: string;
    role: string;
    image: string;
};

export type RecipeItem = {
    id: string;
    title: string;
    time: string;
    image: string;
};


export const categories = [
    "Recipes",
    "Menu",
    "Growth",
    "Product",
    "Reminder",
];

export const WEANING_FEATURES = [
    'What to expect at every stage',
    'Top tips from nutritionists',
    'Yummy recipes',
    '...and much more!',
];

export const JOURNEY_ITEMS: JourneyItem[] = [
    {
        id: '1',
        age: '12+\nmonths',
        title: 'From 12 months',
        description:
            'Getting ready for weaning tips, a handy checklist and more.',
        colorMonth: '#80C700',
    },
    {
        id: '2',
        age: '6+\nmonths',
        title: 'From 6 months',
        description:
            'Explore simple weaning tips and useful nutrition guidance.',
        colorMonth: '#A31578',
    },
];

export const EXPERT_ITEMS: ExpertItem[] = [
    {
        id: '1',
        name: 'Troyan Smith',
        role: 'Nutritionist',
        image: 'https://i.pravatar.cc/200?img=12',
    },
    {
        id: '2',
        name: 'James Wolden',
        role: 'Pediatrician',
        image: 'https://i.pravatar.cc/200?img=11',
    },
    {
        id: '3',
        name: 'Niki Samantha',
        role: 'Dietitian',
        image: 'https://i.pravatar.cc/200?img=47',
    },
    {
        id: '4',
        name: 'Roberta Anny',
        role: 'Nutrition Coach',
        image: 'https://i.pravatar.cc/200?img=45',
    },
];

export const POPULAR_CATEGORIES = [
    'Breakfast',
    'Lunch',
    'Appetizer',
    'Noodle',
    'Salad',
];

export const POPULAR_RECIPES: RecipeItem[] = [
    {
        id: '1',
        title: 'Pepper sweetcorn ramen',
        time: '10 mins',
        image:
            'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
    },
    {
        id: '2',
        title: 'Cheddar cheese shell salad',
        time: '12 mins',
        image:
            'https://images.unsplash.com/photo-1547592180-85f173990554',
    },
    {
        id: '3',
        title: 'Spicy chicken curry noodles',
        time: '15 mins',
        image:
            'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398',
    },
];