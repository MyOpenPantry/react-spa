export interface Recipe {
  id?: number
  name: string;
  steps: string;
  notes?: string;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
