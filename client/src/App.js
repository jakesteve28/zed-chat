import React from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import GuardedRoute from './login/loginGuard';
import { selectAccount } from './account/accountSettingsSlice';
import LoginComponent from './lazyModules/login';
import ForgotPW from './lazyModules/forgotPassword';
import CreateAcc from './lazyModules/createAccount';
import Home from './lazyModules/home';
import NewConv from './lazyModules/newConversation'; 
import SettingScr from './lazyModules/settings';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './index.css';
import 'react-pro-sidebar/dist/css/styles.css';
import {
  selectRefreshExpire, 
  setRefreshExpire
} from './store/store'; 

export default function App() {
  const account = useSelector(selectAccount);
  const dispatch = useDispatch(); 
  const refreshExpire = useSelector(selectRefreshExpire); 
  const now = Date.now(); 
  const history = useHistory();
  const refreshToken = async () => {
  //   const response = await fetch("http://localhost:3000/api/auth/login", {
  //     body: requestBody,
  //     headers: { "content-type": "application/json",
  //                 "Access-Control-Allow-Origin": "localhost:3003"
  //   },
  //     method: "POST",
  //     credentials: 'include'
  // });
    const refreshResult = await fetch("http://localhost:3000/api/auth/refresh");
    const { successful } = await refreshResult.json(); 
    if(successful === true){
      console.log("Refresh token fetch successful"); 
      dispatch(setRefreshExpire(now + 900000)); 
      return true;
    } else {
      console.log("Refresh token fetch failed. Logging out"); 
      dispatch(logout());
      dispatch(clearAccount());
      dispatch(clearAuth());
      dispatch(clearConversations());
      dispatch(clearInvites());
      dispatch(clearFriends());
      history.push('/login');
      return false;
    }
  }
  if(refreshExpire <= now) {
     refreshToken();
  }
  return (
    <Switch>
      <Route path="/login" component={LoginComponent}></Route>
      <Route path="/forgotPassword" component={ForgotPW}></Route>
      <Route path="/createAccount" component={CreateAcc}></Route>
      <GuardedRoute path="/home" component={Home} auth={account.loggedIn}></GuardedRoute>
      <GuardedRoute path="/newConversation" component={NewConv} auth={account.loggedIn}></GuardedRoute>
      <GuardedRoute path="/settings" component={SettingScr} auth={account.loggedIn}></GuardedRoute>
      <GuardedRoute path="/" component={Home} auth={account.loggedIn}></GuardedRoute>
    </Switch>
  )
}