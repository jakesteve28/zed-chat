import React from 'react';
import { Dropdown, Row } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  logout,
  clearAccount,
  selectAccount
} from '../../store/slices/accountSettingsSlice';
import {
  clearConversations
} from '../../store/slices/conversationsSlice';
import {
  clearFriends
} from '../../store/slices/friendsSlice';
import { clearAuth } from '../../store/slices/authSlice';
import { clearInvites } from '../../store/slices/inviteSlice';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import '../../styles/topbar.css';
import '../../styles/dropdowns.css';

export default function SettingsDropdown(){
    const dispatch = useDispatch();
    const account = useSelector(selectAccount);
    const history = useHistory();
    const logoutClient = ()  => {
      dispatch(logout());
      dispatch(clearAccount());
      dispatch(clearAuth());
      dispatch(clearConversations());
      dispatch(clearInvites());
      dispatch(clearFriends());
      console.log("Successfully logged out");
  }
  const logoutAccount = async () => {
      try {
          await fetch("http://localhost:3000/api/auth/logout", {
              credentials: "include"
          });
          logoutClient();
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          history.push('/login');
      } catch(err) {
          console.error("Error: Request to server for logout failed. Logging out account, clearing cookies, and navigating to login page"); 
          logoutClient();
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          history.push('/login');
      }
    }
    return (
        <Dropdown className="topbar-dropdown">              
            <Dropdown.Toggle className="dropdown-toggle dropdown-button-icon text-white" as="button" id="dropdown-custom-2"><MoreVertIcon></MoreVertIcon></Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-custom-bg-settings">
                <Row><span className="account-settings-info">{`@${account.tagName}`}</span></Row>
                <Dropdown.Item className="text-white text-center dropdown-item-settings" as="button" onClick={() => document.querySelector("#accountSettings").click()}>
                  <Link id="accountSettings" className="account-settings-link" as="button" to="/settings">Account&nbsp;<AccountBoxIcon></AccountBoxIcon></Link>
                  </Dropdown.Item>
                <Dropdown.Item className="text-white text-center dropdown-item-settings" as="button" onClick={() => { logoutAccount() }}>
                <Link className="account-settings-link" to="/login">Logout&nbsp;<ExitToAppIcon></ExitToAppIcon></Link>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
}

