import React, { useState, useEffect } from 'react';
import api from '../api';

import {Link, useParams} from 'react-router-dom';

import { Recipe, RIngredient } from "./recipe.interface";

type props = {
  setAppMessage: any
}

const RecipeSingle = (props:props) => {
  const setAppMessage = props.setAppMessage;
  const { id } = useParams<{id: string}>();
  const [recipe, setRecipe] = useState<Recipe>();
  const [ingredients, setIngredients] = useState<RIngredient[]>();
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
    function getRecipe() {
      // TODO clean up the nested api calls
      api.get(`recipes/${id}`)
      .then(resp => {
        setRecipe(resp.data);
        setLoading(false);
        api.get(`recipes/${id}/ingredients`)
          .then(resp => {
            setIngredients(resp.data);
          })
          .catch(e => {
            const error =
            !e.response
            ? 'Network Error'
            : e.response.status === 404
              ? 'Resource Not Found'
              : 'An unexpected error has occured';
            setAppMessage({className:"messageError", message:error});
          })
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

    getRecipe();
  }, [id, setAppMessage]);

  return (<div>
    {loading
    ? (<p>Loading...</p>)
    : (recipe && 
        <section>
          <aside>
            <h1>{recipe.name}</h1>
            <p><small>Created: {getDateString(recipe.createdAt || '')}</small></p>
            <p><small>Updated: {getDateString(recipe.updatedAt || '')}</small></p>
            <p>Rating: {recipe.rating}</p>

            {recipe.notes && 
              <details>
                    <summary>Notes</summary>
                    <p>{recipe.notes}</p>
              </details>
            }

            <h3>Ingredients</h3>
            <ul>
            {ingredients && 
              ingredients.map(ingredient => (
                <li>{ingredient.amount} <Link to={`ingredients/${ingredient.ingredient?.id}`}>{ingredient.ingredient?.name}</Link></li>
              ))
            }
            </ul>
            <h3>Steps</h3>
            <ul>
              {recipe.steps.split('\n').map(step => (
                <li>{step}</li>
              ))}
            </ul>
            <h3>Tags</h3>
            <ul>
            {recipe.tags && 
              recipe.tags.map(tag => (
                <li><Link to={`tags/${tag.id}`}>{tag.name}</Link></li>
              ))
            }
            </ul>

            {/* TODO see if hardcoding is bad, or if I need to manipulate url? */}
            <Link to={`edit/${recipe?.id}`}>Edit</Link>
          </aside>
        </section>
      )
    }
    </div>
  )
}
  
  export default RecipeSingle;