import React, { useState, useEffect } from 'react';
import {
  useRouteMatch,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import ItemForm from "./ItemForm";
import ItemList from "./ItemList";

const defaultAppErrors:string[] = [];

function Items() {
  // errors not related to the form
  const [appErrors, setAppErrors] = useState(defaultAppErrors);
  const { path, url } = useRouteMatch();

  useEffect (() => {
    document.title = `Items`;
  })  

  return (
    <main>
      {appErrors.length > 0 && (
        <ul>
          {appErrors.map((e) => (
            <li>{e}</li>
          ))}
        </ul>
        )
      }

      <Link to={`${url}`}>List</Link>
      <Link to={`${url}/create`}>Create</Link>
      
      <Switch>
        <Route exact path={path}>
          <ItemList setAppErrors={setAppErrors}/>
        </Route>
        <Route path={`${path}/create`}>
          <ItemForm setAppErrors={setAppErrors} />
        </Route>
      </Switch>
   </main>
  )
}

export default Items;