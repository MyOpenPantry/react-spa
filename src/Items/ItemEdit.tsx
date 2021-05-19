import { useEffect, useState } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import AsyncSelect from 'react-select/async';
import api from '../api';

import {useParams} from 'react-router-dom';

import { Item } from "./item.interface";
import { Ingredient } from "../Ingredients/ingredient.interface";

type props = {
    setAppMessages: (errors:string[]) => void
}

interface dropdownValue {
  label?:string;
  value?:number;
}

const defaultItem:Item = {name:'', amount:0};
const defaultIngredient:Ingredient = {name:''}
const defaultValue:dropdownValue = {};

const ItemEdit = (props:props) => {
  // @ts-ignore
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(defaultItem);
  const [etag, setEtag] = useState('');
  const [ingredient, setIngredient] = useState(defaultIngredient);
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
    let toSend:Item = {name: data.name, amount: data.amount}
    if(data.ingredientId) {
      toSend.ingredientId = data.ingredientId;
    }
    if(data.productId) {
      toSend.productId = data.productId;
    }

    api.put(`items/${id}`, toSend, {
      headers: {
        "If-Match":etag,
      }
    })
      .then(res => {
        console.log(res);
        reset({});
        setSelectedValue({});
        setAppMessages(["Item succesfully updated"]);
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
          setAppMessages([error]);
        }
      });
  };

  useEffect(() => {
    async function getItem() {
      const resp = await api.get('items/'+id);
      const item = resp.data;
      setEtag(resp.headers['etag']);
      if (item.ingredientId !== undefined) {
        const ingredient = await api.get('ingredients/'+item.ingredientId).then(resp => resp.data);
        setIngredient(ingredient);
        setSelectedValue({label: ingredient.name, value:ingredient.id});
      } else {
        setSelectedValue({});
      }
      setItem(item);
      setLoading(false);
    }

    getItem();
  }, [id]);

  return loading
        ? (<p>Loading...</p>)
        : (
            <div>
              <h1>Edit Item</h1>
              <form onSubmit={handleSubmit(onSubmit)}>
                <label>Item Name</label>
                <input defaultValue={item.name} {...register("name", { required: true })} />
                {/* errors will return when field validation fails  */}
                {errors.name && (
                  <span style={{'color':'red'}}>
                    {errors.name.message !== '' ? errors.name.message : 'This field is required'}
                  </span>
                )}
                <label>Amount</label>
                <input defaultValue={item.amount} type="number" {...register("amount", { required: true })} />
                {/* errors will return when field validation fails  */}
                {errors.amount && <span style={{'color':'red'}}>{errors.amount.message || 'This field is required'}</span>}
                {/* TODO camera support for barcode scanning on the web app? */}
                <label>Product ID</label>
                <input defaultValue={item.productId} type="number" {...register("productId", {maxLength: 12, min: 0, required: false})} />
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
                    defaultOptions={[{label: ingredient.name, value: ingredient.id}]}
                    isClearable
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

export default ItemEdit;