import React from 'react';
import { Container, Dropdown, Tabs, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Badge } from '@material-ui/core';
import {
  selectAccount
} from '../../store/slices/accountSettingsSlice';
import {
  friendsSlice,
  selectFriendRequests,
  selectFriends
} from '../../store/slices/friendsSlice';
import { selectReceived, acceptedInvites } from '../../store/slices/inviteSlice';
import { FriendRequestListItem } from '../listItems/FriendRequest';
import { AcceptedInviteListItem } from '../listItems/AcceptedInvite';
import { ReceivedInviteListItem } from '../listItems/ReceivedInvite';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Tooltip from '@material-ui/core/Tooltip';
import '../../styles/topbar.css'

export default function NotificationsDropdown() {
    const receivedInvites = useSelector(selectReceived);
    const friendRequests = useSelector(selectFriendRequests);
    const _acceptedInvites = useSelector(acceptedInvites);
    const friends = useSelector(selectFriends);
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
                    if(el && el.accepted === false && el.cancelled === false && el.sender && el.sender.id !== account.id){
                      return (
                        <FriendRequestListItem requestId={el.id} recipientId={el.recipientId} tagName={el.senderTagname} key={`${el.id}`}></FriendRequestListItem>
                      )
                    } else return null;                         
                  })}
                  {receivedInvites.map((el) => {
                    const index = friends.findIndex(fr => fr.id === el.senderId); 
                      if(index !== -1) {
                        return (
                          <ReceivedInviteListItem senderTagname={friends[index]?.tagName} key={el.id} convId={el.conversationId} inviteId={el.id}></ReceivedInviteListItem>
                          )} else {
                        return null; 
                      }
                  })}
                </Tab>
                <Tab eventKey="accepted" title="Accepted">
                  {_acceptedInvites.map((el) => {
                    const index = friends.findIndex(fr => fr.id === el.senderId); 
                      if(index !== -1) {
                        return (
                        <AcceptedInviteListItem inviteId={el.id} senderTagname={friends[index]?.tagName} key={el.id}></AcceptedInviteListItem>
                      )} else {
                        return null; 
                      }
                    })
                  }
                </Tab>
              </Tabs>        
            </Container>            
          </Dropdown.Menu>
      </Dropdown>
    );
}
