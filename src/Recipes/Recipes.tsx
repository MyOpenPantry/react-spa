import React, { useState, useEffect } from 'react';
import {
  useRouteMatch,
  Switch,
  Route,
} from "react-router-dom";
//import RecipeEdit from './RecipeEdit';
import RecipeForm from "./RecipeForm";
import RecipeList from "./RecipeList";
import RecipeSingle from './RecipeSingle';

interface appMessage {
  className: string;
  message: string;
}

function Recipes() {
  // messages passed by children
  const [appMessage, setAppMessage] = useState<appMessage>();
  // eslint-disable-next-line
  const { path, url } = useRouteMatch();

  useEffect (() => {
    document.title = `Recipes`;
  })  

  return (
    <main>
      {appMessage && <article><aside className={appMessage.className}><p>{appMessage.message}</p></aside></article>}

      <Switch>
        <Route exact path={path}>
          <RecipeList setAppMessage={setAppMessage}/>
        </Route>
        <Route exact path={`${path}/create`}>
          <RecipeForm setAppMessage={setAppMessage} />
        </Route>
        {/*
        <Route path={`${path}/edit/:id`}>
          <RecipeEdit setAppMessage={setAppMessage} />
        </Route>
        */}
        <Route path={`${path}/:id`}>
          <RecipeSingle setAppMessage={setAppMessage} />
        </Route>
      </Switch>
   </main>
  )
}

export default Recipes;