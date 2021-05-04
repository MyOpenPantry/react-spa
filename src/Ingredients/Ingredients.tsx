import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";

import api from '../api';

import { Ingredient } from "./ingredient.interface";

const defaultIngredientLists:Readonly<Ingredient>[] = [];
const defaultAppErrors:string[] = [];

function Ingredients() {
  const [ingredients, setIngredients]: [Readonly<Ingredient>[], (ingredients: Readonly<Ingredient>[]) => void] = useState(defaultIngredientLists);
  const [loading, setLoading]: [boolean, (loading: boolean) => void] = useState<boolean>(true);
  // errors not related to the form
  const [appErrors, setAppErrors]: [string[], (appErrors: string[]) => void] = useState(defaultAppErrors);
  // eslint-disable-next-line
  const { register, reset, handleSubmit, setError, formState: { errors } } = useForm<Ingredient>();

  const onSubmit = (data:Ingredient) => {
    // TODO fix this. Surely there's a better way to not send unused optional arguments
    let toSend:Ingredient = {name: data.name}

    api.post('ingredients/', toSend)
      .then(res => {
        console.log(res);
        //console.log(res.data);
        //setIngredients([res.data, ...ingredients])
        reset({});
        fetchData();
      })
      .catch(e => {
        console.log(e);

        // Check for input errors here
        if (e.response.status === 422) {
          const respError = e.response.data.errors.json;
          console.log(respError);
          // TODO iterate over Object.keys()? setError only allows names of the form fields ie: name | ingredientId | productId | ...
          if (respError.name) {
            console.log(respError.name[0])
            setError('name', {type:'resp', message: respError.name[0]}, {shouldFocus: true})
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
    api.get('ingredients/')
      .then(resp => {
        setIngredients(resp.data);
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
    document.title = `Ingredients`;
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
        <h1>Ingredients</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td>{ingredient.id}</td>
                <td>{ingredient.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{float: "left"}}>
        <h1>Add New Ingredient</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Ingredient Name</label>
          <input {...register("name", { required: true })} />
          {/* errors will return when field validation fails  */}
          {errors.name && (
            <span style={{'color':'red'}}>
              {errors.name.message !== '' ? errors.name.message : 'This field is required'}
            </span>
          )}
          <input type="submit" value="Submit" />
        </form>
      </div>
   </main>
  )
}

export default Ingredients;