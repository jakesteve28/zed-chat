import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, InputGroup, FormControl, Container, Row, Col } from 'react-bootstrap'
import { Redirect, Link } from 'react-router-dom'
import regex from '../regex';
import './loginscreen.css';
import {
  setToken
} from '../auth/authSlice';
import {
  addConversation
} from '../currentConversation/conversationsSlice'
import {
  setId,
  setEmail,
  setTagName,
  login, 
  selectAccount
} from '../account/accountSettingsSlice'
import {
  addSentInvite,
  addAcceptedInvite,
  addReceivedInvite
} from '../topbar/inviteSlice'
import { addFriend, 
  addFriendRequest 
} from '../account/friendsSlice';

const getAccount = async (id, authToken) => {
  const account = await fetch(`http://localhost:3000/api/users/${id}`, {
    headers: {
      "Authorization": `Bearer ${authToken}`
    }
  });
  const bodyAcc = await account.json();
  if(bodyAcc.statusCode === 401 || bodyAcc.statusCode === 500){
        return false;
  }
  return bodyAcc;
}

const getAuthToken = async (username, password) => {
  const requestBody = JSON.stringify({
    tagName: `${username}`,
    password: `${password}`
  });
  const response = await fetch("http://localhost:3000/api/auth/login", {
      body: requestBody,
      headers: { "content-type": "application/json" },
      method: "POST"
  });
  const body = await response.json();
  if(body.statusCode === 401 || body.statusCode === 400){
      return false;
  }
  if(body.statusCode === 500){
      console.log("Server error while attempting login!")
      return false;
  }
  if(body.access_token && body.id){
    return { authToken: body.access_token, id: body.id };
  } else {
    console.log("Error retrieving login token from server! Malformed body!", body);
    return false;
  }
}

const getFriendRequests = async (id, authToken) => {
  const friendRequestsRes = await fetch(`http://localhost:3000/api/users/invites/${id}`, {
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      }
    })
    if(friendRequestsRes.status !== 200){
      console.log("Error fetching sent invites from user")
    }
    const friendRequests = await friendRequestsRes.json();
    return friendRequests;
}

const getInvitesReceived = async (id, authToken) => {
  const receivedInvitesRes = await fetch(`http://localhost:3000/api/invite/user/${id}`, {
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type": "application/json"
    }
  })
  const receivedInvites = await receivedInvitesRes.json();
  return receivedInvites;
}

const getInvitesSent = async (id, authToken) => {
  const sentInvitesRes = await fetch(`http://localhost:3000/api/invite/sent/${id}`, {
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type": "application/json"
    }
  })
  if(sentInvitesRes.status !== 200){
    throw Error("Error fetching sent invites from user");
  }
  const sentInvites = await sentInvitesRes.json();
  return sentInvites;
}

function LoginScreen() {
  const [userName, _setUserName] = useState("");
  const [password, _setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);

  const checkInput = () => {
    let passing = true;
    if(regex.tagName.test(userName) === false){
      setErrorMsgs(["Tag name must be 8-24 characters", ...errorMsgs]);
      passing = false;
    }
    if(regex.password.test(password) === false){
      setErrorMsgs(["Password must be 8-32 characters", ...errorMsgs]);
      passing = false;
    }
    if(!passing) setError(true);
    return passing;
  };

  const submit = async () => {
    setError(false);
    setErrorMsgs([]);
    if(!checkInput()){
      console.log("Invalid form field inputs", errorMsgs);
      return;
    }
    const { id, authToken } = await getAuthToken(userName, password);
    const bodyAcc = await getAccount(id, authToken);
    if( id && 
        authToken && 
        bodyAcc && 
        bodyAcc.email && 
        bodyAcc.tagName && 
        Array.isArray(bodyAcc.conversations) &&
        Array.isArray(bodyAcc.friends) &&
        Array.isArray(bodyAcc.friendRequests) &&
        Array.isArray(bodyAcc.friendRequests) 
      ) {
        dispatch(setToken(`${authToken}`))
        dispatch(setEmail(bodyAcc.email))
        dispatch(setTagName(bodyAcc.tagName))
        dispatch(setId(id))
        bodyAcc.conversations.map(conv => {
          dispatch(addConversation({conversation: conv}))
          return conv
        })
        const friends = []
        bodyAcc.friends.map(friend => {
          dispatch(addFriend(friend))
          friends.push(friend)
          return friend
        })
        console.log("Friends: ", friends)
        bodyAcc.friendRequests.map(friendReq => {
          dispatch(addFriendRequest(friendReq));
          return null;
        })  
    } else {
       console.log("Error retrieving user details from server!", errorMsgs);
    }
    const friendRequests = await getFriendRequests(id, authToken);    
    const requests = []
    const sent = []
    if(friendRequests){   
      for(let request of friendRequests){
        if(request.recipientId === bodyAcc.id){   
          requests.push(request)
          dispatch(addFriendRequest(request))
        } else if(request.sender.id === bodyAcc.id) {
          sent.push(request)
        }
      }
    } else {
      console.log("Error fetching received friend requests")
    }
    // console.log("Received Friend Requests: ", requests)
    // console.log("Sent Friend Requests: ", sent)
   // console.log("Friend Requests: ", bodyAcc.friendRequests, "Received: ", receivedFriendRequests)
   // dispatch(setCurrentConversation(bodyAcc.conversations[0]))
    dispatch(login())
    const sentInvites = await getInvitesSent(id, authToken);
    if(sentInvites && Array.isArray(sentInvites)){
      console.log("Sent Invites: " + JSON.stringify(sentInvites))
      for(let invite of sentInvites){
        dispatch(addSentInvite(invite))
      }
    }
    const receivedInvites = await getInvitesReceived(id, authToken);
    if(receivedInvites && Array.isArray(receivedInvites)){
      console.log("Received Invites: " + JSON.stringify(receivedInvites))
      for(let invite of receivedInvites){
        if(invite.accepted === true)
          dispatch(addAcceptedInvite(invite))
        else  
          dispatch(addReceivedInvite(invite))
      }
    }
    console.log("Successfully logged in, account fetched")
  }
  return (
    (!account.loggedIn) ? (
    <Container className="h-100 w-100" fluid>
      <Row className="p-3 mt-5 text-white lead text-center">
        <Col className="p-3 text-center, mx-auto pt-5 mt-5 shadow" style={{ borderRadius: "15px", backgroundColor: "#191919", opacity: 0.6, maxWidth: "500px"}}> 
          <h2 className="text-white" style={{ opacity: 0.8, marginBottom: "35px" }} >Welcome to <span className="text-danger">Project Zed</span></h2>
          <h6 className="text-muted font-italic" style={{ marginBottom: "35px"  }}>Secured by you, for you</h6>
            <InputGroup className="mb-5 mt-3">
                <FormControl
                  style={{marginLeft: "auto", marginRight: "auto", color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px', border: 'none', backgroundColor: "#404040" }}
                  placeholder="@Tagname"
                  aria-label="@Tagname"
                  aria-describedby="basic-addon1"
                  onKeyPress={
                    async (e) => {
                        if(e.key === "Enter") {
                            await submit()
                        }
                    }
                }
                  onChange={ e => _setUserName(e.target.value) }
                />
              </InputGroup>
              <InputGroup className="mb-5">
                <FormControl
                  style={{marginLeft: "auto", marginRight: "auto", color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px',border: 'none',  backgroundColor: "#404040" }}
                  type="password"
                  placeholder="Password"
                  aria-label="Password"
                  aria-describedby="basic-addon1"
                  onKeyPress={
                      async (e) => {
                          if(e.key === "Enter") {
                              await submit()
                          }
                      }
                  }
                  onChange={ e => _setPassword(e.target.value) }
                />
              </InputGroup>
              <Container fluid className="border-top border-dark pt-2">   
                <Row className="mt-3">
                  <Col>               
                    <Button style={{ marginRight: 30, backgroundColor: "#191919", color: "white", opacity: 0.87, border:"none"}} variant="dark" className="mx-auto button-outline-black" onClick={() => document.getElementById("link-create-account").click() }><Link id="link-create-account" style={{ textDecoration: 'none', color: "white" }} to="/createAccount">Create&nbsp;Account</Link></Button>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                      <Button style={{ color: "white", backgroundColor: "#191919", opacity: 0.87, border:"none"}} variant="dark" className="mx-auto button-outline-black " onClick={() => document.getElementById("link-forgot-password").click() }><Link id="link-forgot-password" style={{ textDecoration: 'none', color: "white" }} to="/forgotPassword">Forgot&nbsp;Password?</Link></Button>
                  </Col>
                </Row>
                <Row className="mt-3 mb-5">
                  <Col>
                    <Button onClick={submit} size="lg" className="rounded-pill mb-4 mx-auto" variant="outline-success" style={{ opacity: 0.8, maxWidth: '200px', marginTop: "20px" }} block>Login</Button>
                  </Col>
                </Row>
            </Container>
        </Col> 
      </Row>
      <Row>
        <Col className="text-center">
          <span className="text-danger text-center lead font-italic" style={{ opacity: 0.67 }}>{(error) ? errorMsgs : ""}</span>
        </Col>
      </Row>
    </Container>)
    : <Redirect to="/home"></Redirect>
  );
}

export default LoginScreen;
