import { Ingredient } from "../Ingredients/ingredient.interface";

export interface Recipe {
  id?: number
  name: string;
  steps: string;
  notes?: string;
  rating?: number;
  tags?: Tag[];
  ingredients?: RIngredient[]; // used when POSTING a new recipe
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface RIngredient {
  ingredient?:Ingredient;
  ingredientId?:number;
  amount: number;
  unit: string;
}