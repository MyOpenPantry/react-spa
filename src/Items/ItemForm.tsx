import { useState } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import AsyncSelect from 'react-select/async';
import api from '../api';

import { Item } from "./item.interface";
import { Ingredient } from "../Ingredients/ingredient.interface";

type props = {
    setAppMessages: (errors:string[]) => void
}

interface dropdownValue {
  label?:string;
  value?:number;
}

const defaultValue:dropdownValue = {};

const ItemForm = (props:props) => {
  const methods = useForm<Item>();
  const { register, control, reset, handleSubmit, setError, formState: { errors } } = methods;
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const setAppMessages = props.setAppMessages;

  const handleChange = (value:any) => {
    setSelectedValue(value);
  }

  const promiseOptions = async (inputValue:string) => {
    const query = (inputValue.length > 0) ? `?name=${inputValue}` : '';
    const resp = await api.get(`ingredients/${query}`);
    return resp.data.map((d: Ingredient) => ({
        "value": d.id,
        "label": d.name
      })
    );
  }

  const onSubmit: SubmitHandler<Item> = data => {
    // TODO fix this. Surely there's a better way to not send unused optional arguments
    console.log(data);
    let toSend:Item = {name: data.name, amount: data.amount}
    if(data.ingredientId) {
      toSend.ingredientId = data.ingredientId;
    }
    if(data.productId) {
      toSend.productId = data.productId;
    }

    api.post('items/', toSend)
      .then(res => {
        console.log(res);
        reset({});
        setSelectedValue({});
        setAppMessages(["Item succesfully created"]);
      })
      .catch(e => {
        console.log(e);

        // Check for input errors here
        if (e.response.status === 422) {
          const respError = e.response.data.errors.json;

          for (const [k,] of Object.entries(toSend)) {
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
          setAppMessages([error]);
        }
      });
  };

  return (
      <div>
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
              loadOptions={promiseOptions}
              defaultOptions
              isClearable
              // TODO this doesn't feel right
              // handleChange 'sets' the value, but actually doesn't unless field.onChange is used?
              // handleChange exists so I can have setSelectedValue to clear the form on submit
              // I really need to just sit down and read all the docs THOROUGHLY...
              onChange={val => {
                handleChange(val);
                return field.onChange(val?.value)
              }}
              value={selectedValue}
            />}
          />
          <br />
          <input type="submit" value="Submit" />
        </form>
      </div>
  )
};

export default ItemForm;