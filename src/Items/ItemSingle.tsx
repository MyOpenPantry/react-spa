import React, { useState, useEffect } from 'react';
import api from '../api';

import {Link, useParams} from 'react-router-dom';

import { Item } from "./item.interface";

/*
  This page is currently similar to ItemList's SelectedItem.
  Single components will typically have more information than their Selected counterpart, but Item isn't that interesting for now. 
*/

type props = {
  setAppMessage: any
}

const ItemSingle = (props:props) => {
  const setAppMessage = props.setAppMessage;
  const { id } = useParams<{id: string}>();
  const [item, setItem] = useState<Item>();
  const [loading, setLoading] = useState(true);

  const getDateString = (input:string) => {
    const date = new Date(input);
    return date.toLocaleString();
  }

  // clear the appMessage on initial load
  useEffect(() => {
    setAppMessage(undefined);
  }, [setAppMessage])

  useEffect(() => {
    function getItem() {
      api.get(`items/${id}`)
      .then(resp => {
        setItem(resp.data);
        setLoading(false);
      })
      .catch(e => {
        const error =
        !e.response
        ? 'Network Error'
        : e.response.status === 404
          ? 'Resource Not Found'
          : 'An unexpected error has occured';
        setAppMessage({className:"messageError", message:error});
      });
    }

    getItem();
  }, [id, setAppMessage]);

  return (<div>
    {loading
    ? (<p>Loading...</p>)
    : (
      <section>
        <aside>
          <h1>{item?.name}</h1>
          <p>Amount: {item?.amount}</p>
          <p>ProductId: {item?.productId ? item.productId : 'None'}</p>
          <p>Ingredient: {item?.ingredient 
            ? <Link to={`ingredients/${item.ingredient.id}`}>{item.ingredient.name}</Link>
            : 'None'}
          </p>
          <p>Last Updated: {getDateString(item?.updatedAt as string)}</p>

          {/* TODO see if hardcoding is bad, or if I need to manipulate url? */}
          <Link to={`edit/${item?.id}`}>Edit</Link>
        </aside>
      </section>
      )
    }
    </div>
  )
}
  
  export default ItemSingle;