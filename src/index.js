import React from 'react';
import ReactDOM from 'react-dom';
import {IndexRoute, Route, Router, browserHistory} from 'react-router';

import Frame from './container/Frame';
import Home from './container/Home';
import './index.css';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/buckets" component={Frame}>
      <IndexRoute component={Home} />
    </Route>
  </Router>,
  document.getElementById('root')
);
