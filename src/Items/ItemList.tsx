import React, { useState, useEffect, ChangeEvent, SyntheticEvent } from 'react';
import axios from 'axios';
import api from '../api';

import { Item } from "./item.interface";

const defaultItemLists:Readonly<Item>[] = [];

const ItemList = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState(defaultItemLists);
  const [queryString, setQueryString] = useState('');
  const [cancel, setCancel] = useState(axios.CancelToken.source());
  const [pageState, setPageState] = useState({currentPage: 1, totalPages: 1});
  const [prevButton, setPrevButton] = useState(false);
  const [nextButton, setNextButton] = useState(false);

  const handleOnInputChange = (event:ChangeEvent<HTMLInputElement>) => {
    const arg = event.target.value;
    // TODO pagination
    const query = (arg.length === 0)
      ? ''
      : (/^\d+$/.test(arg) ? '?productId=' : '?name=' ) + arg;
    setQueryString(query);
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
    console.log("updating page state")
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
          setLoading(false);
          setItems(resp.data);
          const pageHeaders = JSON.parse(resp.headers['x-pagination']);
          console.log(pageHeaders);
          setPageState({
            currentPage: pageHeaders['page'],
            totalPages: pageHeaders['last_page']
          });
        })
        .catch(e => {
          if (axios.isCancel(e)) {
            // cancelled from new search input
            return;
          }
          //const error = 
          //e.status === 404
          //  ? 'Resource Not Found'
          //  : 'An unexpected error has occured';
          //props.setAppErrors([error]);
          setLoading(false);
        });
    };

    fetchItems();
  }, [cancel.token, pageState.currentPage, queryString]);

  useEffect(() => {
    setPrevButton(pageState.currentPage > 1);
    setNextButton(pageState.currentPage < pageState.totalPages)
  }, [pageState, items])

  return (
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
            <th>Product ID</th>
          </tr>
        </thead>
        <tbody>
          {loading
          ? (<p>Loading... </p>)
          : (items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.amount}</td>
                <td>{item.productId}</td>
              </tr>
            )))
          }
        </tbody>
      </table>
      <div>
        <button
          style={{
            "display": prevButton ? 'block' : 'none'
          }}
          onClick={handlePrevClick}
        >
          Prev 
        </button>
        <button
          style={{
            "display": nextButton ? 'block' : 'none'
          }}
          onClick={handleNextClick}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default ItemList;