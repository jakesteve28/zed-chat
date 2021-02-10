import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, InputGroup, Spinner, FormControl, Container, Row, Col } from 'react-bootstrap'
import { Redirect, Link } from 'react-router-dom';
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
  addAcceptedInvite,
  addReceivedInvite
} from '../topbar/inviteSlice'
import { addFriend, 
  addFriendRequest 
} from '../account/friendsSlice';
import {
  setTopbarMessage
} from '../uiSlice';

const loginServer = async (username, password) => {
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
  if(body.access_token && body.id && body.user && body.invites){
    console.log("Successfully logging in user", body.user.tagName); 
    return { user: body.user, authToken: body.access_token, id: body.id, invites: body.invites };
  } else {
    console.log("Error retrieving login token from server! Malformed body!", body);
    return false;
  }
}

function LoginScreen() {
  const [userName, _setUserName] = useState("");
  const [password, _setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const [spinning, setSpinning] = useState(false);
  const focusRef = useRef(null);

  useEffect(() => {
    if(focusRef.current) {
      focusRef.current.focus();
    }
  }, [])

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

  useEffect(() => {
      dispatch(setTopbarMessage(""))
  }, []);

  const submit = async () => {
    setError(false);
    setErrorMsgs([]);
    setSpinning(true);
    if(!checkInput()){
      console.log("Invalid form field inputs", errorMsgs);
      setSpinning(false);
      return;
    }
    const result = await loginServer(userName, password);
    if(!result || result === false) {
        setError(true);
        setSpinning(false);
        setErrorMsgs(["Invalid Credentials", ...errorMsgs]);
        return;
    }
    const  { id, authToken, user, invites } = result;
    if( !id || 
        !authToken || 
        !user || 
        !user.email || 
        !user.tagName ||  
        !Array.isArray(user.conversations) ||  
        !Array.isArray(user.friends) || 
        !Array.isArray(user.friendRequests) || 
        !Array.isArray(invites)){
          setError(true);
          setSpinning(false);
          setErrorMsgs(["Invalid Credentials", ...errorMsgs]);
          return;
      }
    dispatch(setToken(`${authToken}`));
    dispatch(setEmail(user.email));
    dispatch(setTagName(user.tagName));
    dispatch(setId(id));
    user.conversations.map(conv => {
        if(conv.pending !== true){
          dispatch(addConversation({ conversation: conv }));
        }
    });
    user.friends.map(friend => {
      dispatch(addFriend(friend));
    }); 
    if(user.friendRequests && Array.isArray(user.friendRequests)){   
      for(let request of user.friendRequests){
        if(request.recipientId === user.id){   
          dispatch(addFriendRequest(request))
        } 
      }
    }
    if(invites && Array.isArray(invites)){
      for(let invite of invites){
        if(invite.accepted === true)
          dispatch(addAcceptedInvite(invite));
        else  
          dispatch(addReceivedInvite(invite));
      }
    }
    dispatch(login());
    console.log("Successfully logged in user " + user.tagName);
    setSpinning(false);
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
                  ref={focusRef}
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
                <Row className="mt-3 mb-2">
                  <Col>
                    {
                      (spinning) ?  <Spinner animation="border" className="mb-4" style={{ height: 60, width: 60 }} variant="success" /> : <Button onClick={submit} size="lg" className="rounded-pill mb-4 mx-auto" variant="outline-success" style={{ opacity: 0.8, maxWidth: '200px', marginTop: "20px" }} block>Login</Button>
                    }
                  </Col>
                </Row>
                <Row className="mt-3 mb-3">
                  { 
                    (error) ? (<Col className="text-center">
                                <ul>
                                  {
                                    errorMsgs.map(err => <li key={err} className="text-danger text-center lead font-italic">{err}</li>)
                                  }
                                </ul>
                              </Col>)
                            : ""
                    }
                    { 
                      (spinning) ? (<Col className="text-center">
                                      <span className="text-success lead font-italic font-weight-bolder" style={{ opacity: 1.0, fontSize: "15pt" }}>Logging in...</span>
                                    </Col>)
                                  : ""
                    }
                  </Row>
            </Container>
        </Col> 
      </Row>
    </Container>)
    : <Redirect to="/home"></Redirect>
  );
}

export default LoginScreen;
