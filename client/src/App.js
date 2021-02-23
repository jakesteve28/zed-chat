import React, { useState } from 'react';
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
import { logout, clearAccount } from './account/accountSettingsSlice'; 
import { clearAuth } from './auth/authSlice';
import { clearConversations } from './currentConversation/conversationsSlice'; 
import { clearInvites } from './topbar/inviteSlice';
import { clearFriends } from './account/friendsSlice';

export default function App() {
  const account = useSelector(selectAccount);
  const dispatch = useDispatch(); 
  const refreshExpire = useSelector(selectRefreshExpire); 
  const now = Date.now(); 
  const history = useHistory();
  const [refreshing, setRefreshing] = useState(false);

  const logoutAccount = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        credentials: "include"
      });
    } catch(err) {
      console.log("Error while requesting logout, cookie is not cleared from browser. Clearing store and logging out", err.message); 
    }
    dispatch(logout());
    dispatch(clearAccount());
    dispatch(clearAuth());
    dispatch(clearConversations());
    dispatch(clearInvites());
    dispatch(clearFriends());
    history.push('/login');
  }

  const refreshToken = async () => {
    let refreshResult = null;
    try {
      refreshResult = await fetch("http://localhost:3000/api/auth/refresh", {
        credentials: "include"
      });
    } catch(err) {
      console.log("Error: fetching refresh token unauthorized, please login"); 
      setRefreshing(false);
      return false;
    }
    const { successful } = await refreshResult.json(); 
    if(account.loggedIn && successful === true){
      console.success("Refresh token fetch successful"); 
      dispatch(setRefreshExpire(now + 900000)); 
      setRefreshing(false); 
      return true;
    } else {
      console.error("Not logged in, not going to attempt refresh. Logging out.")
      console.error("Refresh token fetch failed. Logging out"); 
      await logoutAccount();
      setRefreshing(false); 
      return false;
    }
  }
  if(refreshExpire !== -1 && refreshExpire <= now) {
    if(!refreshing) {
      setRefreshing(true);
      refreshToken();
    }
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