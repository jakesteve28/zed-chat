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
        <Dropdown className="topbar-dropdown" style={{ backgroundColor: "#191919", position: "relative", maxWidth: "100px", opacity: 0.9 }}>              
            <Dropdown.Toggle className="dropdown-toggle text-white" style={{ border:" none", backgroundColor: "#191919"}} as="button" id="dropdown-custom-2"><MoreVertIcon></MoreVertIcon></Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-custom-bg-settings" style={{ backgroundColor: "#191919", maxWidth: "100px" }}>
                <Dropdown.Item  className="text-white text-center dropdown-item-settings" style={{ backgroundColor: "#404040", padding: "15px" }} as="button" onClick={() => document.querySelector("#accountSettings").click()}><Link id="accountSettings" as="button" style={{ textDecoration: 'none', color: "#AAAAAA" }} to="/settings">Account&nbsp;<AccountBoxIcon></AccountBoxIcon></Link></Dropdown.Item>
                <Dropdown.Item  className="text-white text-center dropdown-item-settings" style={{ backgroundColor: "#404040", padding: "15px"}} as="button" onClick={() => { logoutAccount() }}><Link style={{ textDecoration: 'none', color: "#AAAAAA" }} to="/login">Logout&nbsp;<ExitToAppIcon></ExitToAppIcon></Link></Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
}

