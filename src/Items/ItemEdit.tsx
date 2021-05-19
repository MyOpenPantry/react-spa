import { useEffect, useState } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import AsyncSelect from 'react-select/async';
import api from '../api';

import {useParams} from 'react-router-dom';

import { Item } from "./item.interface";
import { IFormInput } from "./itemform.interface";
import { Ingredient } from "../Ingredients/ingredient.interface";

type props = {
    setAppMessages: (errors:string[]) => void
}

const ItemEdit = (props:props) => {
  const { id } = useParams<{id: string}>();
  const { register, control, handleSubmit, setError, setValue, formState: { errors } } =  useForm<IFormInput>();
  const [loading, setLoading] = useState(true);
  const [etag, setEtag] = useState('');
  const setAppMessages = props.setAppMessages;

  const promiseOptions = async (inputValue:string) => {
    const query = (inputValue.length > 0) ? `?name=${inputValue}` : '';
    const resp = await api.get(`ingredients/${query}`);
    return resp.data.map((d: Ingredient) => ({
        "value": d.id,
        "label": d.name
      })
    );
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

    api.put(`items/${id}`, toSend, {headers:{"If-Match":etag}})
      .then(resp => {
        console.log(resp);
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
      const resp = await api.get(`items/${id}`);
      const item = resp.data;
      setEtag(resp.headers['etag']);
      setValue('name', item.name)
      setValue('amount', item.amount);
      if (item.productId) {
        setValue('productId', item.productId)
      }
      if (item.ingredientId) {
        setValue('ingredientId', {label: item.ingredient.name, value:item.ingredient.id});
      }
      setLoading(false);
    }

    getItem();
  }, [id, setValue]);

  return (loading
    ? (<p>Loading...</p>)
    : (
        <div>
          <h1>Edit Item</h1>
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
                //defaultOptions={[{label: ingredient.name, value: ingredient.id}]}
                isClearable
              />}
            />
            <br />
            <input type="submit" value="Submit" />
          </form>
        </div>
    )
  )
};

export default ItemEdit;