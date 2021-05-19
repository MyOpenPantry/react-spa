import { Ingredient } from "../Ingredients/ingredient.interface";

export interface Item {
  id?: number
  name: string;
  amount: number;
  productId?: number;
  updatedAt?: string;
  ingredientId?: number;
  ingredient?:Ingredient;
}
