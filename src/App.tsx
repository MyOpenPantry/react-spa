import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
//  RouteComponentProps
} from "react-router-dom";

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
              <Link to="/items">Items</Link>
              <ul>
                <li><Link to="/items/create">Create</Link></li>
              </ul>
            </li>
            <li>
              <Link to="/recipes">Recipes</Link>
              <ul>
                <li><Link to="/recipes/create">Create</Link></li>
              </ul>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/items' component={Items} />
          <Route path='/recipes' component={Recipes} />
        </Switch>
      </div>
    </Router>
  );
}
 
export default AppRouter;