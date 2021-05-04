import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";

import api from '../api';

import { Recipe } from "./recipe.interface";

const defaultRecipeLists:Readonly<Recipe>[] = [];
const defaultAppErrors:string[] = [];

function Recipes() {
  const [recipes, setRecipes]: [Readonly<Recipe>[], (recipes: Readonly<Recipe>[]) => void] = useState(defaultRecipeLists);
  const [loading, setLoading]: [boolean, (loading: boolean) => void] = useState<boolean>(true);
  // errors not related to the form
  const [appErrors, setAppErrors]: [string[], (appErrors: string[]) => void] = useState(defaultAppErrors);
  // eslint-disable-next-line
  const { register, reset, handleSubmit, setError, formState: { errors } } = useForm<Recipe>();

  const onSubmit = (data:Recipe) => {
    // TODO fix this. Surely there's a better way to not send unused optional arguments
    let toSend:Recipe = {name: data.name, steps: data.steps}
    if(data.rating) {
      toSend.rating = data.rating;
    }
    if(data.notes) {
      toSend.notes = data.notes;
    }

    api.post('recipes/', toSend)
      .then(res => {
        console.log(res);
        reset({});
        fetchData();
      })
      .catch(e => {
        console.log(e);

        // Check for input errors here
        if (e.response.status === 422) {
          const respError = e.response.data.errors.json;
          console.log(respError);

          for (const [k,] of Object.entries(toSend)) {
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

  const fetchData = async () => {
    api.get('recipes/')
      .then(resp => {
        setRecipes(resp.data);
        setLoading(false);
      })
      .catch(e => {
        const error = 
        e.status === 404
          ? 'Resource Not Found'
          : 'An unexpected error has occured';
        setAppErrors([error]);
        setLoading(false);
      });
  }

  useEffect (() => {
    fetchData();
    document.title = `Recipes`;
  }, []);

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
        <h1>Recipes</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Steps</th>
              <th>Rating</th>
              <th>Notes</th>
              <th>Created At</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>{recipe.id}</td>
                <td>{recipe.name}</td>
                <td>{recipe.steps}</td>
                <td>{recipe.rating}</td>
                <td>{recipe.notes}</td>
                <td>{recipe.createdAt}</td>
                <td>{recipe.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{float: "left"}}>
        <h1>Add New Recipe</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Recipe Name</label>
          <input {...register("name", { required: true })} />
          {errors.name && (
            <span style={{'color':'red'}}>
              {errors.name.message !== '' ? errors.name.message : 'This field is required'}
            </span>
          )}
          <label>Steps</label>
          <textarea {...register("steps", { required: true })} />
          {errors.steps && (
            <span style={{'color':'red'}}>
              {errors.steps.message !== '' ? errors.steps.message : 'This field is required'}
            </span>
          )}
          <label>Rating</label>
          <input type="number" {...register("rating", {min: 0, required: false})} />
          {errors.rating && (<span style={{'color':'red'}}>{errors.rating.message}</span>)}
          <label>Notes</label>
          <textarea {...register("notes", {required: false})} />
          {errors.notes && (<span style={{'color':'red'}}>{errors.notes.message}</span>)}
          <input type="submit" value="Submit" />
        </form>
      </div>
   </main>
  )
}

export default Recipes;