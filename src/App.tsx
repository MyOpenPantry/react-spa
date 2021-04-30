import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
//  RouteComponentProps
} from "react-router-dom";

import Ingredients from './Ingredients/Ingredients';
import Items from './Items/Items'; 
import Recipes from './Recipes/Recipes';
import Home from './Home/Home';

function AppRouter() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/ingredients">Ingredients</Link>
            </li>
            <li>
              <Link to="/items">Items</Link>
            </li>
            <li>
              <Link to="/recipes">Recipes</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/ingredients' component={Ingredients} />
          <Route exact path='/items' component={Items} />
          <Route exact path='/recipes' component={Recipes} />
        </Switch>
      </div>
    </Router>
  );
}
 
export default AppRouter;