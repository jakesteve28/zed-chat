import React from 'react';
import { Container, Dropdown, Tabs, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Badge } from '@material-ui/core';
import {
  selectAccount
} from '../../store/slices/accountSettingsSlice';
import {
  selectFriendRequests
} from '../../store/slices/friendsSlice';
import { selectReceived, acceptedInvites } from '../../store/slices/inviteSlice';
import { FriendRequestListItem } from '../listItems/FriendRequest';
import { AcceptedInviteListItem } from '../listItems/AcceptedInvite';
import { ReceivedInviteListItem } from '../listItems/ReceivedInvite';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Tooltip from '@material-ui/core/Tooltip';
import '../topbar/topbar.css'

export default function NotificationsDropdown() {
    const receivedInvites = useSelector(selectReceived);
    const friendRequests = useSelector(selectFriendRequests);
    const _acceptedInvites = useSelector(acceptedInvites);
    const account = useSelector(selectAccount);
    return (
      <Dropdown className="ml-3 p-1 topbar-dropdown" >
          <Tooltip title="Notifications">
            <Dropdown.Toggle as="button" className="top-dropdown-button font-weight-bold rounded-pill ml-2">
              {
                (receivedInvites.length >= 1 || friendRequests.length >= 1) 
                ? 
                <Badge color="default" overlap="circle" badgeContent=" " variant="dot">
                  <NotificationsIcon></NotificationsIcon>
                </Badge> 
                : 
                <NotificationsIcon></NotificationsIcon>
              }
            </Dropdown.Toggle>    
          </Tooltip>   
          <Dropdown.Menu className="dropdown-menu-custom">
            <Dropdown.ItemText className="text-center font-weight-bold lead p-3 pb-2 notifications-label"><NotificationsIcon></NotificationsIcon>&nbsp;&nbsp;Notifications</Dropdown.ItemText>
            <Container fluid className="notifications-menu-tabs-container">
              <Tabs className="tabs-notifications" defaultActiveKey="received" id="uncontrolled-tab-example">
                <Tab className="tab-notifications" eventKey="received" title="Received">
                  {friendRequests.filter(map => map.recipientId === account.id).map((el) => {
                    if(el && el.accepted === false && el.cancelled === false && el.sender.id !== account.id){
                      return (
                        <FriendRequestListItem requestId={el.id} recipientId={el.recipientId} sender={el.sender} tagName={el.sender.tagName} key={`${el.id}`}></FriendRequestListItem>
                      )
                    } else return null;                         
                  })}
                  {receivedInvites.map((el) => {
                    return (
                      <ReceivedInviteListItem sender={(el.sender) ? el.sender : `${el.senderId}`} key={`${Math.random()}`} convId={`${el.conversationId}`} inviteId={`${el.id}`}></ReceivedInviteListItem>
                    )
                  })}
                </Tab>
                <Tab eventKey="accepted" title="Accepted">
                  {_acceptedInvites.map((el) => {
                      return (
                        <AcceptedInviteListItem sender={`${el.senderId}`} key={`${Math.random()}`} convId={`${el.conversationId}`} inviteId={`${el.id}`}></AcceptedInviteListItem>
                      )
                    })
                  }
                </Tab>
              </Tabs>        
            </Container>            
          </Dropdown.Menu>
      </Dropdown>
    );
}
