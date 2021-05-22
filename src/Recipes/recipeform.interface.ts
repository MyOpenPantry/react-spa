export interface dropdownValue {
  label:string;
  value:number;
}

export interface FormIngredient {
  amount:number
  unit:string
  ingredient:dropdownValue
}

export interface IFormInput {
  name:string
  steps:string
  notes?:string
  rating?:number
  ingredients?:FormIngredient[]
  tags?:dropdownValue[]
}
