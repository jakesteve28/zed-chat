import React, { Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import store from './store/store'
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import TopBar from './components/topbar/TopBar';
import NotificationSocket from './components/socket/notificationSocket';
import { selectBackground } from './store/slices/uiSlice';
import Zodd from './assets/zodd.jpg';
import { ToastContainer } from 'react-toastify';

const Wrapper = () => {
  return (
      <React.StrictMode>
        <Provider store={store}>
          <AppWrapper></AppWrapper>
        </Provider>
      </React.StrictMode>
  );
}

const AppWrapper = () => {
  const globalBackground = useSelector(selectBackground);
  const [style, setStyle] = useState({});
  useEffect(() => {
    if(globalBackground.charAt(0) !== '#'){
      setStyle({ backgroundImage: `url("${globalBackground}")`, backgroundColor: "#191919" })
    } else {
      setStyle({ backgroundColor: globalBackground });
    }
  },[globalBackground])
  useEffect(() => {
    setStyle({ backgroundImage: `url(${Zodd})`});
  }, [])
  return (
    <div className="base-div" style={style}>
    <ToastContainer />
      <Router basename='/client/'>
        <Suspense fallback={null}>
          <TopBar />
          <NotificationSocket />
          <App />
        </Suspense>
      </Router>
    </div>
  )
}

ReactDOM.render(
  <Wrapper></Wrapper>,
  document.getElementById('root')
);
