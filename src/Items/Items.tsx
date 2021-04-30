import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";

import api from '../api';

import { Item } from "./item.interface";

const defaultItemLists:Readonly<Item>[] = []; 

function Items() {
  const [items, setItems]: [Readonly<Item>[], (items: Readonly<Item>[]) => void] = useState(defaultItemLists);
  const [loading, setLoading]: [boolean, (loading: boolean) => void] = useState<boolean>(true);
  const [error, setError]: [string, (error: string) => void] = useState("");
  // eslint-disable-next-line
  const { register, reset, handleSubmit, formState: { errors } } = useForm<Item>();

  const onSubmit = (data:Item) => {
    // TODO fix this. Surely there's a better way to not send unused optional arguments
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
        //console.log(res.data);
        setItems([res.data, ...items])
      })
      .catch(e => {
        // TODO more robust handling
        const error = 
        e.response.status === 404
          ? 'Resource Not Found'
          : 'An unexpected error has occured';
        console.log(e);
        setError(error);
        setLoading(false);
      });
    reset({});
  };

  const fetchData = async () => {
    api.get('items/')
      .then(resp => {
        setItems(resp.data);
        setLoading(false);
      })
      .catch(e => {
        const error = 
        e.status === 404
          ? 'Resource Not Found'
          : 'An unexpected error has occured';
        setError(error);
        setLoading(false);
      });
  }

  useEffect (() => {
    fetchData();
    document.title = `Items`;
  }, []);

  return (
    <div>
      {loading && (<p>Loading... </p>)}
      {error && (<p color={'red'}>{error}</p>)}
      <h1>Items</h1>
      <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Last Updated</th>
              <th>Product ID</th>
              <th>Ingredient ID</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.amount}</td>
                <td>{item.updatedAt}</td>
                <td>{item.productId}</td>
                <td>{item.ingredientId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Item Name</label>
          <input {...register("name", { required: true })} />
          {/* errors will return when field validation fails  */}
          {errors.name && <span style={{'color':'red'}}>This field is required </span>}
          <label>Amount</label>
          <input type="number" {...register("amount", { required: true })} />
          {/* errors will return when field validation fails  */}
          {errors.amount && <span style={{'color':'red'}}>This field is required </span>}
          {/* TODO camera support for barcode scanning on the web app? */}
          <label>Product ID</label>
          <input type="number" {...register("productId", {maxLength: 12})} />
          {/* TODO ingredient id will be a dropdown or search */}
          <label>Ingredient ID</label>
          <input type="number" {...register("ingredientId")} />
          <input type="submit" />
        </form>
      </div>
   </div>
  )
}

export default Items;