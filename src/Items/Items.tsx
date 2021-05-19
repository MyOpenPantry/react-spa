import React, { useState, useEffect } from 'react';
import {
  useRouteMatch,
  Switch,
  Route,
} from "react-router-dom";
import ItemEdit from './ItemEdit';
import ItemForm from "./ItemForm";
import ItemList from "./ItemList";

const defaultAppMessages:string[] = [];

function Items() {
  // messages passed by children
  const [appMessages, setAppMessages] = useState(defaultAppMessages);
  // eslint-disable-next-line
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

      <Switch>
        <Route exact path={path}>
          <ItemList setAppMessages={setAppMessages}/>
        </Route>
        <Route path={`${path}/create`}>
          <ItemForm setAppMessages={setAppMessages} />
        </Route>
        <Route path={`${path}/edit/:id`}>
          <ItemEdit setAppMessages={setAppMessages} />
        </Route>
      </Switch>
   </main>
  )
}

export default Items;