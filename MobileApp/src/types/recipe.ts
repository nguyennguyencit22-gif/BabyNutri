export interface Recipe {
    id: number;
    name: string;
    description: string;
    image_url: string;
    expert_id: number | null;
    meal_type_id: number | null;
    mealType?: string;
    expertName?: string;
    cooking_time: number;
    prep_time: number;
    serves: number;
    month_age: number;
    calories: number;
    protein: number;
    fat: number;
    carbohydrate: number;
    ingredients: string[];
    steps: string[];
    allergies?: string[];
    assets?: {
      stickers: string[];
      heroImages: string[];
      gallery: string[];
    };
  }
  
  export interface RecipeListItem {
    id: number;
    name: string;
    image_url: string;
    month_age: number;
    calories: number;
    cooking_time: number;
    mealType?: string;
  }
  
  export interface IngredientInput {
    name: string;
    quantity: string;
  }
  
  export interface CreateRecipeDTO {
    name: string;
    description: string;
    imageUrl: string;
    calories: number;
    monthAge: number;
    mealTypeId?: number;
    cookingTime?: number;
    prepTime?: number;
    serves?: number;
    protein?: number;
    fat?: number;
    carbohydrate?: number;
    ingredients: IngredientInput[];
    steps: string[];
  }
  
  export type UpdateRecipeDTO = Partial<Omit<CreateRecipeDTO, 'ingredients' | 'steps'>>;
  
  export interface RecipeSearchParams {
    query?: string;
    mealTypeId?: number;
    minAge?: number;
    maxAge?: number;
  }