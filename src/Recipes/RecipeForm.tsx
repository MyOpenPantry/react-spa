import { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler, useFieldArray } from "react-hook-form";
import AsyncCreatableSelect from 'react-select/async-creatable';
import api from '../api';

import { Recipe, RIngredient, Tag } from "./recipe.interface";
import { IFormInput } from "./recipeform.interface";
import { Ingredient } from "../Ingredients/ingredient.interface";

type props = {
    setAppMessage: any
}

const RecipeForm = (props:props) => {
  const setAppMessage = props.setAppMessage;
  const methods = useForm<IFormInput>({
    defaultValues:{name:'', steps:'', rating:0, notes:'', ingredients:[], tags:[]}
  });
  const {register, control, reset, handleSubmit, setError, setValue, getValues, formState: { errors }} = methods;
  const {fields, append, remove} = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "ingredients", // unique name for your Field Array
  });
  const [isLoading, setIsLoading] = useState(false);

  const promiseIngredientOptions = async (inputValue:string) => {
    const query = (inputValue.length > 0) ? `?name=${inputValue}` : '';
    const resp = await api.get(`ingredients/${query}`);
    return resp.data.map((d: Ingredient) => ({
        "value": d.id,
        "label": d.name
      })
    );
  }

  const promiseTagOptions = async (inputValue:string) => {
    const query = (inputValue.length > 0) ? `?name=${inputValue}` : '';
    const resp = await api.get(`tags/${query}`);
    return resp.data.map((d: Tag) => ({
        "value": d.id,
        "label": d.name
      })
    );
  }

  const handleIngredientCreate = (ingredientId:number, inputValue: any) => {
    setIsLoading(true);
    api.post('ingredients/', {'name':inputValue})
      .then(resp => {
        // @ts-ignore
        setValue(`ingredients.${ingredientId}.ingredient` as const, {label: resp.data.name, value: resp.data.id});
      })
      .catch(e => {
        if (!e.response) {
          setAppMessage({className:"messageError", message:"Network Error"});
        } else if (e.response.status === 422) {
          console.log(e.response.data.errors.json); 
          const respError = e.response.data.errors.json;
          setError('ingredients', {type:'resp', message: respError['name'][0]}, {shouldFocus: true})
        }
      });
    setIsLoading(false);
  }

  const handleTagCreate = (inputValue: any) => {
    setIsLoading(true);
    api.post('tags/', {'name':inputValue})
      .then(resp => {
        const tags = getValues('tags');
        // append the new tag the the previous list if it exists, otherwise create a new list
        if (tags) {
          setValue('tags', [...tags, {label: resp.data.name, value: resp.data.id}]);
        } else {
          setValue('tags', [{label: resp.data.name, value: resp.data.id}]);
        }
      })
      .catch(e => {
        if (!e.response) {
          setAppMessage({className:"messageError", message:"Network Error"});
        } else if (e.response.status === 422) {
          console.log(e.response.data.errors.json); 
          const respError = e.response.data.errors.json;
          setError('tags', {type:'resp', message: respError['name'][0]}, {shouldFocus: true})
        }
      });
    setIsLoading(false);
  }

  const onSubmit: SubmitHandler<IFormInput> = data => {
    // TODO fix this. Surely there's a better way to not send unused optional arguments
    console.log(data);
    let toSend:Recipe = {name: data.name, steps: data.steps}
    if(data.rating) {
      toSend.rating = data.rating;
    }
    if (data.notes) {
      toSend.notes = data.notes;
    }
    if (data.ingredients) {
      toSend.ingredients = data.ingredients.map(i => ({'ingredientId':i.ingredient.value, 'amount':i.amount, 'unit':i.unit})) as RIngredient[];
    }
    console.log(toSend);

    api.post('recipes/', toSend)
      .then(resp => {
        if (data.tags) {
          const recipeId = resp.data.id;
          const tagIds = data.tags.map(t => t.value)
          api.post(`recipes/${recipeId}/tags`, {'tagIds': tagIds})
            .catch(e => {
              setAppMessage({className:"messageError", message:"Error adding tags to recipe"});
              return;
            })
        }
        console.log(resp);
        reset({name:'', steps:'', rating:0, notes:'', ingredients:[], tags:[]});
        setAppMessage({className:"messageSuccess", message:"Recipe successfully created"});
      })
      .catch(e => {
        console.log(e);

        if (!e.response) {
          setAppMessage({className:"messageError", message:"Network Error"});
        } else if (e.response.status === 422) {
          const respError = e.response.data.errors.json;

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
          setAppMessage({className:"messageError", message:error});
        }
        return;
      });
  };

  // clear the appMessage on initial load
  useEffect(() => {
    setAppMessage(undefined);
  }, [setAppMessage])

  return (
      <div>
        <h1>Add New Recipe</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Recipe Name</label>
          <input {...register("name", { required: true })} />
          {errors.name && <span style={{'color':'red'}}>{errors.name.message || 'This field is required'}</span>}
          <label>Rating</label>
          <input type="number" {...register("rating", { required: false })} />
          {errors.rating && <span style={{'color':'red'}}>{errors.rating.message}</span>}
          <label>Steps</label>
          <textarea {...register("steps", { required: true })} />
          {errors.steps && <span style={{'color':'red'}}>{errors.steps.message || 'This field is required'}</span>}
          <label>Notes</label>
          <textarea {...register("notes")} />
          {errors.notes && <span style={{'color':'red'}}>{errors.notes.message}</span>}
          <label>Ingredients</label>
          <div>
          {fields.map((field:any, index) => (
            <div key={field.id}>
              <label>Ingredient</label>
              <Controller
                name={`ingredients.${index}.ingredient` as const}
                control={control}
                defaultValue={field.ingredient}
                render={({ field }) => <AsyncCreatableSelect 
                  {...field}
                  loadOptions={promiseIngredientOptions}
                  onCreateOption={(inputValue:string) => handleIngredientCreate(index, inputValue)}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  defaultOptions
                  isClearable
                />}
              />
              <label>Amount</label>
              <input
                type="number"
                {...register(`ingredients.${index}.amount` as const)} 
                defaultValue={field.amount} // make sure to include defaultValue
              />
              <label>Unit</label>
              <input
                {...register(`ingredients.${index}.unit` as const)} 
                defaultValue={field.unit} // make sure to include defaultValue
              />
              <button type="button" onClick={() => remove(index)}>Delete</button>
            </div>
          ))}
          {//@ts-ignore
            (<button type="button" onClick={() => append()}>New Ingredient</button>)
          }
          </div>
          <label>Tags</label>
          <Controller
            name="tags"
            control={control}
            defaultValue
            render={({ field }) => <AsyncCreatableSelect 
              {...field}
              isMulti
              loadOptions={promiseTagOptions}
              onCreateOption={handleTagCreate}
              isLoading={isLoading}
              isDisabled={isLoading}
              defaultOptions
              isClearable
            />}
          />
          <br />
          <input type="submit" value="Submit" />
        </form>
      </div>
  )
};

export default RecipeForm;