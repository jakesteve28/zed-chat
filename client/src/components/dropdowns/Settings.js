import React from 'react';
import { Dropdown} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  logout,
  clearAccount
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
import '../topbar/topbar.css';
import './dropdowns.css';

export default function SettingsDropdown(){
    const dispatch = useDispatch();
    const logoutAccount = async () => {
        await fetch("http://localhost:3000/api/auth/logout", {
          credentials: "include"
        });
        dispatch(logout());
        dispatch(clearAccount());
        dispatch(clearAuth());
        dispatch(clearConversations());
        dispatch(clearInvites());
        dispatch(clearFriends());
        console.log("Successfully logged out");
    }
    return (
        <Dropdown className="topbar-dropdown">              
            <Dropdown.Toggle className="dropdown-toggle dropdown-button-icon text-white" as="button" id="dropdown-custom-2"><MoreVertIcon></MoreVertIcon></Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-custom-bg-settings">
                <Dropdown.Item className="text-white text-center dropdown-item-settings" as="button" onClick={() => document.querySelector("#accountSettings").click()}><Link id="accountSettings" className="account-settings-link" as="button" to="/settings">Account&nbsp;<AccountBoxIcon></AccountBoxIcon></Link></Dropdown.Item>
                <Dropdown.Item className="text-white text-center dropdown-item-settings" as="button" onClick={() => { logoutAccount() }}><Link className="account-settings-link" to="/login">Logout&nbsp;<ExitToAppIcon></ExitToAppIcon></Link></Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
}

