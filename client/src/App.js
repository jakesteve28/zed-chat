import React, { useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import GuardedRoute from './components/loginScreen/loginGuard';
import LoginComponent from './modules/login';
import ForgotPW from './modules/forgotPassword';
import CreateAcc from './modules/createAccount';
import Home from './modules/home';
import StartChatScreen from './modules/startChat'; 
import SettingScr from './modules/settings';
import {
  selectRefreshExpire, 
  setRefreshExpire
} from './store/store'; 
import { logout, clearAccount, selectAccount } from './store/slices/accountSettingsSlice'; 
import { clearAuth } from './store/slices/authSlice';
import { clearConversations } from './store/slices/conversationsSlice'; 
import { clearInvites } from './store/slices/inviteSlice';
import { clearFriends } from './store/slices/friendsSlice';
import 'react-toastify/dist/ReactToastify.css';
import 'react-pro-sidebar/dist/css/styles.css';
import './App.css';
import './index.css';

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
      <GuardedRoute path="/newConversation" component={StartChatScreen} auth={account.loggedIn}></GuardedRoute>
      <GuardedRoute path="/settings" component={SettingScr} auth={account.loggedIn}></GuardedRoute>
      <GuardedRoute path="/" component={Home} auth={account.loggedIn}></GuardedRoute>
    </Switch>
  )
}