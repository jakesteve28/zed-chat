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
import { logout, clearAccount } from './account/accountSettingsSlice'; 
import { clearAuth } from './auth/authSlice';
import { clearConversations } from './currentConversation/conversationsSlice'; 
import { clearInvites } from './topbar/inviteSlice';
import { clearFriends } from './account/friendsSlice';
import { CookiesProvider } from 'react-cookie';

export default function App() {
  const account = useSelector(selectAccount);
  const dispatch = useDispatch(); 
  const refreshExpire = useSelector(selectRefreshExpire); 

  const now = Date.now(); 
  const history = useHistory();

  const refreshToken = async () => {
    const refreshResult = await fetch("http://localhost:3000/api/auth/refresh", {
      credentials: "include"
    });
    const { successful } = await refreshResult.json(); 
    if(account.loggedIn && successful === true){
      console.success("Refresh token fetch successful"); 
      dispatch(setRefreshExpire(now + 900000)); 
      return true;
    } else {
      console.error("Not logged in, not going to attempt refresh. Logging out.")
      console.error("Refresh token fetch failed. Logging out"); 
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
  if(refreshExpire !== -1 && refreshExpire <= now) {
     refreshToken();
  }

  return (
    <CookiesProvider>
      <Switch>
        <Route path="/login" component={LoginComponent}></Route>
        <Route path="/forgotPassword" component={ForgotPW}></Route>
        <Route path="/createAccount" component={CreateAcc}></Route>
        <GuardedRoute path="/home" component={Home} auth={account.loggedIn}></GuardedRoute>
        <GuardedRoute path="/newConversation" component={NewConv} auth={account.loggedIn}></GuardedRoute>
        <GuardedRoute path="/settings" component={SettingScr} auth={account.loggedIn}></GuardedRoute>
        <GuardedRoute path="/" component={Home} auth={account.loggedIn}></GuardedRoute>
      </Switch>
    </CookiesProvider>
  )
}