import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useForm } from "react-hook-form";
import axios, { CancelTokenSource } from 'axios';
import api from '../api';

import { Item } from "./item.interface";

const defaultItemLists:Readonly<Item>[] = [];
const defaultAppErrors:string[] = [];
const cancelToken = axios.CancelToken;

function Items() {
  const [items, setItems]: [Readonly<Item>[], (items: Readonly<Item>[]) => void] = useState(defaultItemLists);
  const [loading, setLoading] = useState(true);
  // errors not related to the form
  const [appErrors, setAppErrors]: [string[], (appErrors: string[]) => void] = useState(defaultAppErrors);
  const [queryString, setQueryString] = useState('');
  const [cancel, setCancel]: [CancelTokenSource, (setCancel: CancelTokenSource) => void]= useState(cancelToken.source());

  // eslint-disable-next-line
  const { register, reset, handleSubmit, setError, formState: { errors } } = useForm<Item>();

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
        reset({});
        fetchItems();
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
          setLoading(false);
        }
      });
  };

  const fetchItems = useCallback(() => {
    api.get('items/' + queryString, {
      cancelToken: cancel.token,
    })
      .then(resp => {
        setItems(resp.data);
        setLoading(false);
      })
      .catch(e => {
        if (axios.isCancel(e)) {
          // cancelled from new search input
          return;
        }
        const error = 
        e.status === 404
          ? 'Resource Not Found'
          : 'An unexpected error has occured';
        setAppErrors([error]);
        setLoading(false);
      });
  }, [cancel.token, queryString]);

  const handleOnInputChange = (event:ChangeEvent<HTMLInputElement>) => {
    const arg = event.target.value;
    // TODO pagination
    const query = (arg.length === 0)
      ? ''
      : (/^\d+$/.test(arg) ? '?productId=' : '?name=' ) + arg;
    setQueryString(query);
    //setLoading(true);
    if (cancel) {
      cancel.cancel();
    }
    setCancel(axios.CancelToken.source())
    fetchItems();
  }

  useEffect (() => {
    fetchItems();
    document.title = `Items`;
  }, [fetchItems]);

  return (
    <main>
      {loading && (<p>Loading... </p>)}
      {appErrors.length > 0 && (
        <ul>
          {appErrors.map((e) => (
            <li>{e}</li>
          ))}
        </ul>
        )
      }
      <div style={{float: "left"}}>
        <h1>Items</h1>
        <label htmlFor="search-input">
					<input
						type="text"
						placeholder="Search..."
            onChange={handleOnInputChange}
					/>
        </label>
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
      </div>
      <div style={{float: "left"}}>
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
          <label>Ingredient ID</label>
          <input type="number" {...register("ingredientId", {min: 0, required: false})} />
          {errors.ingredientId && <span style={{'color':'red'}}>{errors.ingredientId.message}</span>}
          <input type="submit" value="Submit" />
        </form>
      </div>
   </main>
  )
}

export default Items;