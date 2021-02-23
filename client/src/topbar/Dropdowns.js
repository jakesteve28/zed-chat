import React, { useState, useRef } from 'react'
import { Button, Container, Row, Dropdown, Col, FormControl, InputGroup, Tabs, Tab } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import './topbar.css'
import { Badge } from '@material-ui/core'
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import {
  selectAccount,
  logout,
  clearAccount
} from '../account/accountSettingsSlice';
import {
  clearConversations,
  selectCurrentConversation,
  selectConversations
} from '../currentConversation/conversationsSlice';
import {
  selectFriends,
  selectFriendRequests,
  clearFriends
} from '../account/friendsSlice';
import { useSelector, useDispatch } from 'react-redux'
import { clearAuth } from '../auth/authSlice';
import { selectReceived, acceptedInvites, clearInvites } from './inviteSlice';
import regex from '../regex'
import { notificationSocket } from '../socket/notificationSocket'
import { SearchOutlined } from '@material-ui/icons';
import { FriendListItem, 
        ReceivedInviteListItem, 
        AcceptedInviteListItem,
        FriendRequestListItem
      } from './ListItems.js';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import NotificationsIcon from '@material-ui/icons/Notifications';
import GroupIcon from '@material-ui/icons/Group';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Tooltip from '@material-ui/core/Tooltip';

export function FriendsDropdown(){
    const dispatch = useDispatch();
    const history = useHistory();
    const account = useSelector(selectAccount);
    const friends = useSelector(selectFriends);
    const conversations = useSelector(selectConversations);
    const [addFriendInput, setAddFriendInput] = useState("");
    const [searchFriendInput, setSearchFriendInput] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [filteredFriends, setFilteredFriends] = useState(null);
    const [searchError, setSearchError] = useState(false);
    const [addError, setAddError] = useState(false);
    const errorMsgs = useRef([]);
    const currentConversation = useSelector(selectCurrentConversation);
    
    const checkInput = () => {
      let passing = true;
      errorMsgs.current = []
      if(regex.tagNameSearch.test(searchFriendInput) === false){
        passing = false;
        errorMsgs.current.push("Invalid friend name");
      }
      if(account.tagName === searchFriendInput){
        passing = false;
        errorMsgs.current.push("Cannot search/send self");
      }
      if(!passing) setError(true);
      return passing;
    }

    const checkAddFriendInput = () => {
      let passing = true;
      errorMsgs.current = []
      if(regex.tagName.test(addFriendInput) === false){
        passing = false;
        errorMsgs.current.push("Invalid tagname. Try 8-24 letters, numbers, dashes, underscores");
      }
      if(friends.filter(friend => friend.tagName === addFriendInput).length > 0) {
        passing = false;
        errorMsgs.current.push("Friend already exists");
      }
      if(!passing) setError(true);
      return passing;
    }

    const searchFriends = () => {
      setError(false);
      setSuccess(false);
      if(!errorMsgs.current || Array.isArray(errorMsgs.current) === false || errorMsgs.current.length !== 0){
        errorMsgs.current = []
      }
      setSearchError(false);
      if(checkInput() === false){
        console.log("Error searching friend's list, invalid tag name!");
        setSearchError(true);
        return;
      }
      console.log(`Filtering friend's list by tagname | ${addFriendInput}`);
      if(friends.length > 1){
        setFilteredFriends(friends.filter(friend => friend.tagName.includes(searchFriendInput) ||
                                          searchFriendInput.includes(friend.tagName))); 
      }
    }

    const sendFriendRequest = async () => {
      setError(false);
      setSuccess(false);
      if(!errorMsgs.current || Array.isArray(errorMsgs.current) === false || errorMsgs.current.length !== 0){
        errorMsgs.current = []
      }
      setAddError(false);
      if(checkAddFriendInput() === false){
        console.log("Error cannot send friend request", errorMsgs);
        setAddError(true)
        return;
      }
      if(account && notificationSocket){
          notificationSocket.emit('sendFriendRequest', {
            senderId: account.id,
            recipientId: addFriendInput
          }, () => {
            console.log(`Friend request sent to user @${addFriendInput}`);
          });
        } else {
          console.log("Error sending friend request, not connected to notifications socket");
      }
    }

    return (
      <Dropdown className="ml-3 p-1" style={{ backgroundColor: "#191919" }} >
        <Tooltip title="Friends List">
          <Dropdown.Toggle as="button" style={{ border: "none", color: "white", backgroundColor: "#191919" }} className="top-dropdown-button font-weight-bold rounded-pill ml-2">
              <PeopleAltIcon></PeopleAltIcon>
          </Dropdown.Toggle>
        </Tooltip>
        <Dropdown.Menu style={{ backgroundColor: "#191919", minWidth: "325px"}} className="dropdown-menu-custom-bg">
        <Dropdown.ItemText className="text-center font-weight-bold lead mb-1" style={{ backgroundColor: "#191919", opacity: 0.9, color: "#AAAAAA" }}><GroupIcon></GroupIcon>&nbsp;&nbsp;Friends</Dropdown.ItemText>
          <Container fluid className="h-100" style={{ backgroundColor: "#191919", minWidth: "325px", paddingTop: "20px"}}>
            <Row className="m-1">
              <Col xs="10">
                  <InputGroup>
                    <FormControl
                      style={{marginLeft: "auto", maxWidth: "250px", marginRight: "auto", color: "white", opacity: 0.87, minWidth: "200px", minHeight: '50px', backgroundColor: "#202020", border: 'none' }}
                      placeholder="Add Friend By Tagname"
                      aria-label="Add Friend By Tagname"
                      aria-describedby="basic-addon1"
                      className={(addError) ? "search-friend-bar error-placeholder" : "search-friend-bar"}
                      onChange={(e) => { setAddFriendInput(e.target.value) }}
                    />
                </InputGroup>
              </Col>
              <Col xs="2">
                <Button variant="dark" className="mr-3 pr-2" style={{ display: "block", marginRight: "auto", marginLeft: "-15px", backgroundColor: "#191919", border: "none", color: "#555555" }} onClick={() => sendFriendRequest() } disabled={(addFriendInput.length < 8)}><PersonAddIcon className={(addError) ? "error-icon" : ""} style={{ height: 30, width: 30, color: "#AAAAAA" }}></PersonAddIcon></Button>
              </Col>
            </Row> 
            <Row className="m-1 mt-2 mb-2 mb-1 pb-3">
                <Col xs="10">
                    <InputGroup>
                      <FormControl
                        style={{marginLeft: "auto", maxWidth: "250px", marginRight: "auto", color: "white", opacity: 0.87, minWidth: "200px", minHeight: '50px', backgroundColor: "#202020", border: 'none' }}
                        placeholder="Search Friends..."
                        aria-label="Search Friends..."
                        aria-describedby="basic-addon1"
                        className={(searchError) ? "search-friend-bar error-placeholder" : "search-friend-bar"}
                        onChange={(e) => { setSearchFriendInput(e.target.value) }}
                      />
                  </InputGroup>
                </Col>
                <Col xs="2">
                  <Button variant="dark" style={{  display: "block", marginRight: "auto", marginLeft: "-15px", backgroundColor: "#191919", border: "none", color: "#555555" }} onClick={() => searchFriends() }><SearchOutlined className={(searchError) ? "error-icon" : ""} style={{ height: 30, width: 30, color: "#AAAAAA" }}></SearchOutlined></Button>
                </Col>
              </Row> 
              <Row style={{ maxWidth: "250px", minWidth: "250px", overflowY: "scroll", marginRight: "auto", marginLeft: "15px"}} className="mt-1 pb-1">
                <Col style={{ maxHeight: "190px" }}>
                {
                 (Array.isArray(filteredFriends)) ?
                      filteredFriends.map((el) => {
                        const convsWithFriend = []
                        if(conversations && Array.isArray(conversations)) {
                          for(let conv of conversations) {
                             if(conv.users && Array.isArray(conv.users)) {
                               for(let user of conv.users) {
                                   if(user.tagName === el.tagName) {
                                       convsWithFriend.push(conv);
                                       break;
                                   }
                               }
                             }
                          }
                        }
                        if(el && el.tagName){
                          return (
                            <Row key={el.tagName} style={{ maxHeight: "65px" , backgroundColor: "#505050"}} className="friend-topbar">
                              <FriendListItem 
                                account={account} 
                                currentConversation={currentConversation} 
                                history={history} 
                                dispatch={dispatch} 
                                conversations={convsWithFriend} 
                                key={el.tagName} 
                                tagName={el.tagName} 
                                isOnline={el.isOnline}>
                              </FriendListItem>
                            </Row>
                          )
                        } else return null;                          
                      })
                  :
                    friends.map((el) => {
                      if(el && el.tagName){
                        const convsWithFriend = []
                        if(conversations && Array.isArray(conversations)) {
                           for(let conv of conversations) {
                              if(conv.users && Array.isArray(conv.users)) {
                                for(let user of conv.users) {
                                    if(user.tagName === el.tagName) {
                                        convsWithFriend.push(conv);
                                        break;
                                    }
                                }
                              }
                           }
                        }
                        return (
                            <Row key={el.tagName} style={{ maxHeight: "65px" , backgroundColor: "#505050"}} className="friend-topbar">
                              <FriendListItem 
                                account={account} 
                                currentConversation={currentConversation} 
                                history={history} 
                                dispatch={dispatch} 
                                conversations={convsWithFriend} 
                                key={el.tagName} 
                                tagName={el.tagName} 
                                isOnline={el.isOnline}>
                              </FriendListItem>
                            </Row>
                        )
                      } else return null;                          
                    })
                  }
                </Col>
              </Row>  
          </Container>
          { (error) ? (
          <Container fluid className="text-left lead" style={{ opacity: 0.9 }}>
            <Row className="font-italic text-danger" style={{ margin: "20px", borderBottom: "1px solid red", opacity: 0.87 }}>
                Errors:
            </Row>  
          <Row>
            <ul>
              {errorMsgs.current.map(el => (<li className="text-danger text-small" key={el}>{el}</li>))}
            </ul>
          </Row>
          </Container>
          ) : "" }
          {
            (success) ? (
              <Container fluid className="text-left" style={{ opacity: 0.9 }}>
                <Row className="font-italic text-success" style={{ margin: "20px", opacity: 0.87 }}>
                    {successMsg}
                </Row>  
              </Container>
            ) : ""
          }
        </Dropdown.Menu>
      </Dropdown>
    );
  }


  
export function NotificationsDropdown() {
    const receivedInvites = useSelector(selectReceived);
    const friendRequests = useSelector(selectFriendRequests);
    const _acceptedInvites = useSelector(acceptedInvites);
    const account = useSelector(selectAccount);
    return (
      <Dropdown className="ml-3 p-1 topbar-dropdown" style={{ backgroundColor: "#191919", opacity: 0.95 }} >
          <Tooltip title="Notifications">
            <Dropdown.Toggle as="button" style={{ border: "none", color: "white", backgroundColor: "#191919" }} className="top-dropdown-button font-weight-bold rounded-pill ml-2">
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
          <Dropdown.Menu className="dropdown-menu-custom-bg" style={{ backgroundColor: "#191919", minWidth: "350px" }}>
            <Dropdown.ItemText className="text-center font-weight-bold lead p-3 pb-2" style={{ opacity: 0.9, color: "#AAAAAA" }}><NotificationsIcon></NotificationsIcon>&nbsp;&nbsp;Notifications</Dropdown.ItemText>
            <Container fluid style={{ maxHeight: "250px", minHeight: "250px", minWidth: "250px", overflowY: "scroll"}}>
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

export function SettingsDropdown(){
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