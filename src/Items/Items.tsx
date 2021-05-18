import React, { useState, useEffect } from 'react';
import {
  useRouteMatch,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import ItemForm from "./ItemForm";
import ItemList from "./ItemList";

const defaultAppMessages:string[] = [];

function Items() {
  // errors not related to the form
  const [appMessages, setAppMessages] = useState(defaultAppMessages);
  const { path, url } = useRouteMatch();

  useEffect (() => {
    document.title = `Items`;
  })  

  return (
    <main>
      {appMessages.length > 0 && (
        <ul>
          {appMessages.map((e) => (
            <li>{e}</li>
          ))}
        </ul>
        )
      }

      <Link to={`${url}`}>List</Link>
      <Link to={`${url}/create`}>Create</Link>
      
      <Switch>
        <Route exact path={path}>
          <ItemList setAppMessages={setAppMessages}/>
        </Route>
        <Route path={`${path}/create`}>
          <ItemForm setAppMessages={setAppMessages} />
        </Route>
      </Switch>
   </main>
  )
}

export default Items;