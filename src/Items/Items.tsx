import React, { useState, useEffect } from 'react';
import {
  useRouteMatch,
  Switch,
  Route,
} from "react-router-dom";
import ItemEdit from './ItemEdit';
import ItemForm from "./ItemForm";
import ItemList from "./ItemList";
import ItemSingle from './ItemSingle';

interface appMessage {
  className: string;
  message: string;
}

function Items() {
  // messages passed by children
  const [appMessage, setAppMessage] = useState<appMessage>();
  // eslint-disable-next-line
  const { path, url } = useRouteMatch();

  useEffect (() => {
    document.title = `Items`;
  })  

  return (
    <main>
      {appMessage && <article><aside className={appMessage.className}><p>{appMessage.message}</p></aside></article>}

      <Switch>
        <Route exact path={path}>
          <ItemList setAppMessage={setAppMessage}/>
        </Route>
        <Route exact path={`${path}/create`}>
          <ItemForm setAppMessage={setAppMessage} />
        </Route>
        <Route path={`${path}/edit/:id`}>
          <ItemEdit setAppMessage={setAppMessage} />
        </Route>
        <Route path={`${path}/:id`}>
          <ItemSingle setAppMessage={setAppMessage} />
        </Route>
      </Switch>
   </main>
  )
}

export default Items;