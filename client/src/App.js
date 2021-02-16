import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
export default function App() {
  const account = useSelector(selectAccount);
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