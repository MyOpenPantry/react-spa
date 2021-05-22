import React, { useState, useEffect, ChangeEvent, SyntheticEvent } from 'react';
import axios from 'axios';
import api from '../api';

import {Link, useRouteMatch} from 'react-router-dom';

import { Recipe } from "./recipe.interface";

type props = {
  setAppMessage:any
}

const RecipeList = (props:props) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe|void>();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>();
  const [queryString, setQueryString] = useState('');
  const [cancel, setCancel] = useState(axios.CancelToken.source());
  const [pageState, setPageState] = useState({currentPage: 1, totalPages: 1, prevButton: false, nextButton: false});

  const setAppMessage = props.setAppMessage;

  const handleOnInputChange = (event:ChangeEvent<HTMLInputElement>) => {
    const arg = event.target.value;
    // TODO currently assumes any arg of only integers means the user wants to search for a productID, otherwise name
    // maybe make the user explicitly choose?
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
    // cancel previous requests, otherwise clicking too fast can cause it to loop between 2 pages
    if (cancel) {
      cancel.cancel();
    }
    setCancel(axios.CancelToken.source());

    // update currentPage to fire off a new fetchrecipes() call
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

  const handleDelete = async (recipe:Recipe) => {
    const confirm = window.confirm(`Delete Recipe "${recipe.name}"?`);
  
    if (!confirm) {
      return;
    }
  
    // send a get request to obtain the recipe's etag
    api.get(`recipes/${recipe.id}`)
      .then(resp => {
        const etag = resp.headers?.etag;
        api.delete(`recipes/${recipe.id}`, {headers:{"If-Match":etag}})
          .then(resp => {
            setAppMessage({className:"messageSuccess", message:"Recipe was successfully deleted"});
            setSelectedRecipe(undefined);
            // remove the recipe from the list (if it exists), otherwise it will still be there after deletion
            recipes && setRecipes(recipes.filter((i:Recipe) => i.id !== recipe.id));
          })
          .catch(e => {
            setAppMessage({className:"messageError", message:"There was an error deleting the recipe"});
          });
      })
      .catch(e => {
        setAppMessage({className:"messageError", message:"There was an error retrieving the recipe's etag"});
        return;
      });
  }

  // clear the appMessage on initial load
  useEffect(() => {
    setAppMessage(undefined);
  }, [setAppMessage])

  useEffect (() => {
    const fetchrecipes = () => {
      const url = `recipes/${queryString}${pageState.currentPage > 1 ? `${queryString.length > 0 ? '&' : '?'}page=${pageState.currentPage}&page_size=10` : ''}`;
      api.get(url, {
        cancelToken: cancel.token,
      })
        .then(resp => {
          setAppMessage(undefined);
          setLoading(false);
          setRecipes(resp.data);
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
          !e.response
          ? 'Network Error'
          : e.response.status === 404
            ? 'Resource Not Found'
            : 'An unexpected error has occured';
          setAppMessage({className:"messageError", message:error});
          setLoading(false);
        });
    };

    fetchrecipes();
  }, [cancel.token, pageState.currentPage, queryString, setAppMessage]);

  return (
    <div>
      <h1>recipes</h1>
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
                  </tr>
                </thead>
                <tbody>
                  {recipes && recipes.map((recipe) => (
                    <tr key={recipe.id}>
                      <td>
                        <button
                          onClick={() => setSelectedRecipe(recipe)}
                          className="disguisedButton"
                        >
                          {recipe.name}
                        </button>
                      </td>
                      <td>{recipe.rating}</td>
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
              {selectedRecipe
                ? <Selectedrecipe 
                    recipe={selectedRecipe}
                    closeCallback={() => setSelectedRecipe()}
                    deleteCallback={(i:Recipe) => handleDelete(i)}
                  />
                : ''
              }
            </div>
          </div>
        )
      }
    </div>
  )
}

const Selectedrecipe = (props:{recipe:Recipe, closeCallback:any, deleteCallback:any}) => {
  const recipe = props.recipe;
  const closeCallback = props.closeCallback;
  const deleteCallback = props.deleteCallback;
  // eslint-disable-next-line
  let { path, url } = useRouteMatch();

  const getDateString = (input:string) => {
    const date = new Date(input);
    return date.toLocaleString();
  }

  return (
    <section>
      <aside>
        <h1>{recipe.name}</h1>
        <p>Notes: {recipe.notes ? recipe.notes : 'None'}</p>
        <p>Rating: {recipe.rating }</p>
        <p>Last Updated: {getDateString(recipe.updatedAt as string)}</p>

        <Link to={`${url}/${recipe.id}`}>View</Link>
        &nbsp;
        <Link to={`${url}/edit/${recipe.id}`}>Edit</Link>
        &nbsp;
        <button onClick={() => closeCallback()} className="disguisedButton">
          Close
        </button>
        &nbsp;
        <button onClick={() => deleteCallback(recipe)} className="disguisedButton" style={{"color":"red", "float":"right"}}>
          Delete
        </button>
      </aside>
    </section>
  )
}

export default RecipeList;