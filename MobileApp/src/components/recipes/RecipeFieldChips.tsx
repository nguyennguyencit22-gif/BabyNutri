export { ChipSelectRow } from '../articles/ArticleFieldChips';

export const RECIPE_MEAL_TYPES = [
  { id: 1, name: 'Breakfast' },
  { id: 2, name: 'Lunch' },
  { id: 3, name: 'Dinner' },
  { id: 4, name: 'Snack' },
];

export const RECIPE_WEANING_METHODS = [
  { id: 1, name: 'Puree' },
  { id: 2, name: 'Mashed' },
  { id: 3, name: 'Baby-Led Weaning' },
  { id: 4, name: 'Finger Food' },
];

export const RECIPE_DIETARY_NEEDS = [
  { id: 1, name: 'Dairy-Free' },
  { id: 2, name: 'Gluten-Free' },
  { id: 3, name: 'Egg-Free' },
  { id: 4, name: 'Nut-Free' },
  { id: 5, name: 'Vegetarian' },
];

export const RECIPE_OCCASIONS = [
  { id: 1, name: 'Everyday' },
  { id: 2, name: 'First Foods' },
  { id: 3, name: 'Meal Prep' },
  { id: 4, name: 'On-the-Go' },
  { id: 5, name: 'Special Occasion' },
];

export const toOptionNames = (list: { id: number; name: string }[] | string[]): string[] => {
  return list.map((item) => (typeof item === 'string' ? item : item.name));
};

