import { useState } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import AsyncSelect from 'react-select/async';
import api from '../api';

import { Item } from "./item.interface";
import { Ingredient } from "../Ingredients/ingredient.interface";

type props = {
    setAppErrors: (errors:string[]) => void
}

interface IFormInput {
  name:string
  amount:number
  productId?:number
  ingredientId?:{label: string; value: number}
}

const ItemForm = (props:props) => {
  const methods = useForm<IFormInput>();
  const { register, control, reset, handleSubmit, setError, formState: { errors } } = methods;
  const [selectedValue, setSelectedValue] = useState(null);
  const setAppErrors = props.setAppErrors;

  const handleChange = (value:any) => {
    setSelectedValue(value);
  }

  const promiseOptions = (inputValue:string) => {
    const query = (inputValue.length > 0) ? `?name=${inputValue}&page_size=15` : '?page_size=15';
    return api.get(`ingredients/${query}`).then(resp => resp.data.map((d:Ingredient) => ({
      "value" : d.id,
      "label" : d.name
    })));
  }

  const onSubmit: SubmitHandler<IFormInput> = data => {
    // TODO fix this. Surely there's a better way to not send unused optional arguments
    let toSend:Item = {name: data.name, amount: data.amount}
    if(data.ingredientId) {
      toSend.ingredientId = data.ingredientId.value;
    }
    if(data.productId) {
      toSend.productId = data.productId;
    }

    api.post('items/', toSend)
      .then(res => {
        console.log(res);
        reset({});
        setSelectedValue(null);
        setAppErrors([]);
      })
      .catch(e => {
        console.log(e);

        // Check for input errors here
        if (e.response.status === 422) {
          const respError = e.response.data.errors.json;

          for (const [k,] of Object.entries(toSend)) {
            console.log(k)
            if (k in respError) {
              setError(k as any, {type:'resp', message: respError[k][0]}, {shouldFocus: true})
            }
          }
        } else {
          // TODO more robust handling
          const error = 
          e.response.status === 404
            ? 'Resource Not Found'
            : 'An unexpected error has occured';
          setAppErrors([error]);
        }
      });
  };

  return (
      <div style={{float: "right"}}>
        <h1>Add New Item</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Item Name</label>
          <input {...register("name", { required: true })} />
          {/* errors will return when field validation fails  */}
          {errors.name && (
            <span style={{'color':'red'}}>
              {errors.name.message !== '' ? errors.name.message : 'This field is required'}
            </span>
          )}
          <label>Amount</label>
          <input type="number" {...register("amount", { required: true })} />
          {/* errors will return when field validation fails  */}
          {errors.amount && <span style={{'color':'red'}}>{errors.amount.message || 'This field is required'}</span>}
          {/* TODO camera support for barcode scanning on the web app? */}
          <label>Product ID</label>
          <input type="number" {...register("productId", {maxLength: 12, min: 0, required: false})} />
          {errors.productId && <span style={{'color':'red'}}>{errors.productId.message}</span>}
          {/* TODO ingredient id will be a dropdown or search */}
          <label>Ingredient</label>
          <Controller
            name="ingredientId"
            control={control}
            render={({ field }) => <AsyncSelect 
              {...field}
              cacheOptions
              // @ts-ignore
              loadOptions={promiseOptions}
              defaultOptions
              isClearable
              onChange={handleChange}
              value={selectedValue}
            />}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
  )
};

export default ItemForm;