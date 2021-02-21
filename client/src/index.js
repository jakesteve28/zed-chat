import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store from './store/store'
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import TopBar from './topbar/TopBar';

ReactDOM.render(
  <div className="base-div" style={{backgroundColor: "#191919"}}>
    <React.StrictMode>
      <Provider store={store}>
        <Router basename='/client/'>
          <Suspense fallback={null}>
            <TopBar></TopBar>
            <App />
          </Suspense>
        </Router>
      </Provider>
    </React.StrictMode>
  </div>,
  document.getElementById('root')
);
