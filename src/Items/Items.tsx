import React, { useEffect } from 'react';

import ItemForm from "./ItemForm";
import ItemList from "./ItemList";

//const defaultAppErrors:string[] = [];

function Items() {
  // errors not related to the form
  //const [appErrors, setAppErrors] = useState(defaultAppErrors);

  useEffect (() => {
    document.title = `Items`;
  })  

  return (
    <main>
      {/*{appErrors.length > 0 && (
        <ul>
          {appErrors.map((e) => (
            <li>{e}</li>
          ))}
        </ul>
        )
      }*/}

      <ItemList />

      <ItemForm />
   </main>
  )
}

export default Items;