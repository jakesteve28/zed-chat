import React, { useState, useRef } from 'react'
import { Button, Container, Row, Dropdown, Col, FormControl, InputGroup, Tabs, Tab } from 'react-bootstrap'
import { Link } from 'react-router-dom'
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
  clearConversations
} from '../currentConversation/conversationsSlice';
import {
  selectFriends,
  selectFriendRequests,
  clearFriends
} from '../account/friendsSlice';
import { useSelector, useDispatch } from 'react-redux'
import { selectToken, clearAuth } from '../auth/authSlice';
import { selectReceived, acceptedInvites, clearInvites } from './inviteSlice';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import regex from '../regex'
import { notificationSocket } from '../socket/notificationSocket'
import { SearchOutlined } from '@material-ui/icons';
import { FriendListItem, 
        ReceivedInviteListItem, 
        AcceptedInviteListItem,
        FriendRequestListItem
      } from './ListItems.js';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

export function FriendsDropdown(){
    const token = useSelector(selectToken);
    const account = useSelector(selectAccount);
    const friends = useSelector(selectFriends);
    const [addFriendInput, setAddFriendInput] = useState("");
    const [searchFriendInput, setSearchFriendInput] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [searchError, setSearchError] = useState(false);
    const [addError, setAddError] = useState(false);
    const errorMsgs = useRef([]);

    const checkInput = () => {
      if(!errorMsgs.current || Array.isArray(errorMsgs.current) === false || errorMsgs.current.length !== 0){
          errorMsgs.current = []
      }
      let passing = true;
      if(regex.tagName.test(addFriendInput) === false){
        passing = false;
        errorMsgs.current.push("Invalid friend name");
      }
      if(account.tagName === addFriendInput){
        passing = false;
        errorMsgs.current.push("Cannot search/send self");
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
      if(checkInput() === false){
        console.log("Error cannot send friend request", errorMsgs);
        setAddError(true)
        return;
      }
      if(token && account && notificationSocket){
          notificationSocket.emit('sendFriendRequest', {
            senderId: account.id,
            recipientId: addFriendInput
          }, () => console.log("Successfully emitted send friend request"));
          setSuccess(true);
          setSuccessMsg(`Sent friend request to @${addFriendInput}`);
          setTimeout(() => {
            setSuccess(false);
            setSuccessMsg("");
          }, 2000);
        } else {
          console.log("Error sending friend request, not connected to notifications socket");
      }
    }

    return (
      <Dropdown className="ml-3 p-1" style={{ backgroundColor: "#191919", opacity: 0.8}} >
        <Dropdown.Toggle as="button" style={{ border: "none", color: "white", backgroundColor: "#191919" }} className="font-weight-bold rounded-pill ml-2">
            <PeopleAltIcon></PeopleAltIcon>
        </Dropdown.Toggle>
        <Dropdown.Menu style={{ backgroundColor: "#191919 ", minWidth: "325px"}} className="shadow my-dropdown my-dropdown-">
        <Dropdown.ItemText className="text-center font-weight-bold" style={{ opacity: 0.7 }}></Dropdown.ItemText>
          <Container fluid className="" style={{ maxHeight: "320px", minHeight: "320px", minWidth: "325px"}}>
            <Row className="m-1 mt-2 mb-2">
              <Col xs="10">
                  <InputGroup>
                    <FormControl
                      style={{marginLeft: "auto", maxWidth: "250px", marginRight: "auto", color: "white", opacity: 0.87, minWidth: "200px", minWidth: "200px", minHeight: '50px', backgroundColor: "#505050", border: 'none' }}
                      placeholder="Add Friend By Tagname"
                      aria-label="Add Friend By Tagname"
                      aria-describedby="basic-addon1"
                      className="search-friend-bar"
                      onChange={(e) => { setAddFriendInput(e.target.value) }}
                    />
                </InputGroup>
              </Col>
              <Col xs="2">
                <Button variant="dark" className="mr-3 pr-2" style={{ display: "block", marginRight: "auto", marginLeft: "-15px", backgroundColor: "#191919", border: "none", color: "#555555" }} onClick={() => sendFriendRequest() }><span className={(addError) ? "text-danger": ""}><PersonAddIcon></PersonAddIcon></span></Button>
              </Col>
            </Row> 
            <Row className="m-1 mt-2 mb-2 border-bottom border-dark mb-1 pb-3">
                <Col xs="10">
                    <InputGroup>
                      <FormControl
                        style={{marginLeft: "auto", maxWidth: "250px", marginRight: "auto", color: "white", opacity: 0.87, minWidth: "200px", minHeight: '50px', backgroundColor: "#505050", border: 'none' }}
                        placeholder="Search Friends..."
                        aria-label="Search Friends..."
                        aria-describedby="basic-addon1"
                        className="search-friend-bar w-100"
                        onChange={(e) => { setSearchFriendInput(e.target.value) }}
                      />
                  </InputGroup>
                </Col>
                <Col xs="2">
                  <Button variant="dark" style={{  display: "block", marginRight: "auto", marginLeft: "-15px", backgroundColor: "#191919", border: "none", color: "#555555" }} onClick={() => searchFriends() }><span className={(searchError) ? "text-danger": ""}><SearchOutlined></SearchOutlined></span></Button>
                </Col>
              </Row> 
              <Row style={{ maxWidth: "250px", minWidth: "250px", overflowY: "scroll", marginRight: "auto", marginLeft: "15px"}} className="mt-1 pb-1">
                <Col style={{ maxHeight: "190px" }}>
                {
                 (Array.isArray(filteredFriends) && filteredFriends.length > 1) ?
                      filteredFriends.map((el) => {
                        if(el && el.tagName){
                          return (
                            <Row style={{ maxHeight: "65px" , backgroundColor: "#505050"}} className="friend-topbar">
                              <FriendListItem key={el.tagName} tagName={el.tagName}></FriendListItem>
                            </Row>
                          )
                        } else return null;                          
                      })
                  :
                    friends.map((el) => {
                      if(el && el.tagName){
                        return (
                            <Row style={{ maxHeight: "65px" , backgroundColor: "#505050"}} className="friend-topbar">
                              <FriendListItem key={el.tagName} tagName={el.tagName}></FriendListItem>
                              </Row>
                        )
                      } else return null;                          
                    })
                  }
                  <Row style={{ maxHeight: "65px" , backgroundColor: "#252525"}} className="friend-topbar">
                  <FriendListItem tagName={"asdf1237"} key={"14512qgq25t"} isOnline={true}></FriendListItem>
                  </Row>
                  <Row style={{ maxHeight: "65px" , backgroundColor: "#252525"}} className="friend-topbar">
                    <FriendListItem tagName={"mock1234"} key={"14512qgq25t"} isOnline={true}></FriendListItem>
                  </Row>
                  <Row style={{ maxHeight: "65px" , backgroundColor: "#252525"}} className="friend-topbar">
                    <FriendListItem tagName={"mock3243"} key={"14512qgq25t"} isOnline={true}></FriendListItem>
                  </Row>
                  <Row style={{ maxHeight: "65px" , backgroundColor: "#252525"}} className="friend-topbar">
                    <FriendListItem tagName={"mock3421"} key={"14512qgq25t"} isOnline={true}></FriendListItem>
                  </Row>
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
              {errorMsgs.current.map(el => (<li className="text-danger text-small">{el}</li>))}
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


  
export function NotificationsDropdown(){



    // const acceptFriendRequest = (id, recipientId) => {
      //   console.log("Accept Friend Request Clicked", id, recipientId, account.id)
      //   if(notificationSocket && account){
      //     if(recipientId === account.id){
      //       notificationSocket.emit("acceptFriendRequest", JSON.stringify({ friendRequestId: id }));
      //     }
      //   }
      // }
      // const sendAccept = (inviteId, userId, conversationId) => {
      //   if(notificationSocket){
      //     console.log("Accepting invite", { inviteId: inviteId, userId: userId, conversationId: conversationId }, receivedInvites);
      //     notificationSocket.emit("acceptInvite", JSON.stringify({ inviteId: inviteId, userId: userId, conversationId: conversationId }))
      //   }
      //   const invite = JSON.parse(JSON.stringify(receivedInvites.filter(inv => inv.id === inviteId)[0]));
      //   if(invite){
      //     dispatch(removeReceivedInvite(inviteId));
      //     dispatch(addAcceptedInvite(invite));
      //     console.log("Invite accepted");
      //   }
      // }
    const receivedInvites = useSelector(selectReceived);
    const friendRequests = useSelector(selectFriendRequests);
    const _acceptedInvites = useSelector(acceptedInvites);
    const account = useSelector(selectAccount);
    return (
      <Dropdown className="ml-3 p-1" style={{ backgroundColor: "#191919", opacity: 0.95 }} >
        <Dropdown.Toggle as="button" style={{ border: "none", color: "white", backgroundColor: "#191919" }} className="font-weight-bold rounded-pill ml-2">
          {
            (receivedInvites.length > 1|| friendRequests.length > 1) 
            ? 
            <Badge color="secondary" overlap="circle" badgeContent=" " variant="dot">
              <NotificationsNoneIcon></NotificationsNoneIcon>
            </Badge> 
            : 
            <NotificationsNoneIcon></NotificationsNoneIcon>
          }
        </Dropdown.Toggle>       
          <Dropdown.Menu style={{ backgroundColor: "#191919 ", minWidth: "300px" }} className="my-dropdown my-dropdown-">
            <Dropdown.ItemText className="text-center text-white" style={{ opacity: 0.67 }}>Notifications</Dropdown.ItemText>
            <Container fluid style={{ maxHeight: "250px", minHeight: "250px", minWidth: "250px", overflowY: "scroll"}}>
            <Tabs className="tabs-notifications" defaultActiveKey="received" id="uncontrolled-tab-example">
              <Tab className="tab-notifications" eventKey="received" title="Received">
                {friendRequests.filter(map => map.recipientId === account.id).map((el) => {
                  if(el && el.accepted === false && el.cancelled === false && el.sender.id !== account.id){
                    return (
                      <FriendRequestListItem requestId={el.id} recipientId={el.recipientId} sender={el.sender} key={`${el.id}`}></FriendRequestListItem>
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
    const logoutAccount = () => {
        dispatch(logout());
        dispatch(clearAccount());
        dispatch(clearAuth());
        dispatch(clearConversations());
        dispatch(clearInvites());
        dispatch(clearFriends());
        console.log("Successfully logged out");
    }
    return (
        <Dropdown variant="secondary" style={{ backgroundColor: "#404040", position: "relative", zIndex: "10"}}>              
            <Dropdown.Toggle className="dropdown-toggle text-white" style={{ border:" none", backgroundColor: "#191919"}} as="button" id="dropdown-custom-2"><MoreVertIcon></MoreVertIcon></Dropdown.Toggle>
            <Dropdown.Menu style={{ backgroundColor: "#404040"} } className="my-dropdown text-white">
                <Dropdown.Item  className="text-white" style={{ backgroundColor: "#404040"}} as="button" onClick={() => document.querySelector("#accountSettings").click()}><Link id="accountSettings" as="button" style={{ textDecoration: 'none', color: "white" }} to="/settings">Account</Link></Dropdown.Item>
                <Dropdown.Item  className="text-white" style={{ backgroundColor: "#404040"}} as="button" onClick={() => { logoutAccount() }}><Link style={{ textDecoration: 'none', color: "white" }} to="/login">Logout</Link></Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
}