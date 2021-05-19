import React, { useState, useEffect } from 'react';
import api from '../api';

import {Link, useParams, useRouteMatch} from 'react-router-dom';

import { Item } from "./item.interface";

/*
  This page is currently similar to ItemList's SelectedItem.
  Single components will typically have more information than their Selected counterpart, but Item isn't that interesting for now. 
*/

const ItemSingle = () => {
  const { id } = useParams<{id: string}>();
  // eslint-disable-next-line
  const {path, url} = useRouteMatch();
  const [item, setItem] = useState<Item>();
  const [loading, setLoading] = useState(true);

  const getDateString = (input:string) => {
    const date = new Date(input);
    return date.toLocaleString();
  }

  useEffect(() => {
    async function getItem() {
      const resp = await api.get(`items/${id}`);
      setItem(resp.data);
      setLoading(false);
    }

    getItem();
  }, [id]);

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

          <Link to={`${url}/edit/${item?.id}`}>Edit</Link>
        </aside>
      </section>
      )
    }
    </div>
  )
}
  
  export default ItemSingle;