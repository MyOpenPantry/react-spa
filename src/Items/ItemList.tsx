import React, { useState, useEffect, ChangeEvent, SyntheticEvent } from 'react';
import axios from 'axios';
import api from '../api';

import {Link, useRouteMatch} from 'react-router-dom';

import { Item } from "./item.interface";

const defaultItemLists:Readonly<Item>[] = [];
const defaultItem:Item = {name:'', amount:0}

type props = {
  setAppMessages: (errors:string[]) => void
}

const ItemList = (props:props) => {
  const [selectedItem, setSelectedItem] = useState(defaultItem);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState(defaultItemLists);
  const [queryString, setQueryString] = useState('');
  const [cancel, setCancel] = useState(axios.CancelToken.source());
  const [pageState, setPageState] = useState({currentPage: 1, totalPages: 1, prevButton: false, nextButton: false});

  const setAppMessages = props.setAppMessages;

  const handleOnInputChange = (event:ChangeEvent<HTMLInputElement>) => {
    const arg = event.target.value;
    // TODO currently assumes any arg of only integers means the user wants to search for a productID
    const query = (arg.length === 0)
      ? ''
      : (/^\d+$/.test(arg) ? '?productId=' : '?name=' ) + arg;
    setQueryString(query);
    // return to page 1 whenever the input changes, otherwise the query will use the current page (which may be empty)
    setPageState({
      ...pageState,
      currentPage: 1,
    })
    if (cancel) {
      cancel.cancel();
    }
    setCancel(axios.CancelToken.source());
  }

  const handlePageClick = (amount:number) => {
    // update currentPage to fire off a new fetchItems() call
    setPageState({
      ...pageState,
      currentPage: pageState.currentPage + amount,
    })
  }

  const handleNextClick = (event:SyntheticEvent) => {
    event.preventDefault();
    handlePageClick(1);
  }

  const handlePrevClick = (event:SyntheticEvent) => {
    event.preventDefault();
    handlePageClick(-1);
  }

  useEffect (() => {
    const fetchItems = () => {
      const url = `items/${queryString}${pageState.currentPage > 1 ? `${queryString.length > 0 ? '&' : '?'}page=${pageState.currentPage}&page_size=10` : ''}`;
      api.get(url, {
        cancelToken: cancel.token,
      })
        .then(resp => {
          setAppMessages([]);
          setLoading(false);
          setItems(resp.data);
          const pageHeaders = JSON.parse(resp.headers['x-pagination']);
          setPageState({
            currentPage: pageHeaders['page'],
            totalPages: pageHeaders['last_page'],
            prevButton: pageHeaders['page'] > 1,
            nextButton: pageHeaders['page'] < pageHeaders['last_page']
          });
        })
        .catch(e => {
          if (axios.isCancel(e)) {
            // cancelled from new search input
            return;
          }
          const error =
          !e.status
          ? 'Network Error'
          : e.status === 404
            ? 'Resource Not Found'
            : 'An unexpected error has occured';
          setAppMessages([error]);
          setLoading(false);
        });
    };

    fetchItems();
  }, [cancel.token, pageState.currentPage, queryString, setAppMessages]);

  return (
    <div>
      <h1>Items</h1>
      <label htmlFor="search-input">
        <input
          type="text"
          placeholder="Search..."
          onChange={handleOnInputChange}
        />
      </label>
      {loading
        ? (<p>Loading...</p>)
        : (
          <div>
            <div>
              <table style={{"float":"left"}}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Product ID</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="disguisedButton"
                        >
                          {item.name}
                        </button>
                      </td>
                      <td>{item.amount}</td>
                      <td>{item.productId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{"float":"left", "clear":"both"}}>
                <button
                  onClick={handlePrevClick}
                  disabled={!pageState.prevButton}
                >
                  Prev 
                </button>
                &nbsp;
                <button
                  onClick={handleNextClick}
                  disabled={!pageState.nextButton}
                >
                  Next
                </button>
              </div>
            </div>
            <div>
              {selectedItem !== defaultItem
                ? <SelectedItem item={selectedItem} closeCallback={() => setSelectedItem(defaultItem)} />
                : ''
              }
            </div>
          </div>
        )
      }
    </div>
  )
}

const SelectedItem = (props:{item:Item, closeCallback:any}) => {
  const item = props.item;
  const closeCallback = props.closeCallback;
  // eslint-disable-next-line
  let { path, url } = useRouteMatch();
  const getDateString = (input:string) => {
    const date = new Date(input);
    return date.toLocaleString();
  }
  return (
    <section>
      <aside>
        <h1>{item.name}</h1>
        <p>Amount: {item.amount}</p>
        <p>ProductId: {item.productId}</p>
        <p>IngredientId: {item.ingredientId}</p>
        <p>Last Updated: {getDateString(item.updatedAt as string)}</p>

        <Link to={`${url}/edit/${item.id}`}>Edit</Link>
        &nbsp;
        <button onClick={() => closeCallback()} className="disguisedButton">
          Close
        </button>
      </aside>
    </section>
  )
}

export default ItemList;