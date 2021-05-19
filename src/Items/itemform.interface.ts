interface dropdownValue {
    label:string;
    value:number;
  }
  
export interface IFormInput {
    name:string
    amount:number
    productId?:number|null
    ingredientId?:dropdownValue|null
}
