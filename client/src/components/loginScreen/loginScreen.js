import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, InputGroup, Spinner, FormControl, Container, Row, Col } from 'react-bootstrap';
import { Redirect, Link } from 'react-router-dom';
import {
  addConversation
} from '../../store/slices/conversationsSlice';
import {
  setId,
  setEmail,
  setTagName,
  login, 
  selectAccount
} from '../../store/slices/accountSettingsSlice';
import {
  addAcceptedInvite,
  addReceivedInvite
} from '../../store/slices/inviteSlice';
import { addFriend, 
  addFriendRequest 
} from '../../store/slices/friendsSlice';
import {
  setTopbarMessage
} from '../../store/slices/uiSlice';
import {
  setRefreshExpire
} from '../../store/store';
import regex from '../../util/regex';
import './loginscreen.css';

const loginServer = async (username, password) => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      body: JSON.stringify({
        tagName: `${username}`,
        password: `${password}`
      }),
      headers: { "content-type": "application/json",
    },
      method: "POST"
    });
    const body = await response.json();
    const { statusCode, id, user, invites, refreshToken } = body; 
    if(statusCode === 401 || statusCode === 400){
        console.log("Error: Unauthorized, invalid credentials");
        return false;
    }
    if(statusCode === 500){
        console.log("Error: Server error while attempting login!")
        return false;
    }
    if(refreshToken === true) {
       console.log("Refresh token successfully set and will timeout in 15 mins or " + Date.now() + 900000);
    }
    console.log("Successfully logging in user", user.tagName); 
    return { user, id, invites, refreshToken };
  } catch(err) {
    console.log("Error: Unable to login. Please refresh.", err);
    return false;
  }
}

const validateAccountDetails = (id, user, invites) => {
  if(!id || 
      !user || 
      !user?.email || 
      !user?.tagName ||  
      !Array.isArray(user?.conversations) ||  
      !Array.isArray(user?.friends) || 
      !Array.isArray(user?.friendRequests) || 
      !Array.isArray(invites))
      {
        return false 
      }
    else return true
}

function LoginScreen() {
  const [userName, _setUserName] = useState("");
  const [password, _setPassword] = useState("");
  const [allowLogin, setAllowLogin] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const [spinning, setSpinning] = useState(false);
  const [loggingInCookie, setLoggingInCookie] = useState(false); 
  const focusRef = useRef(null);
  useEffect(() => {
    if(focusRef.current) {
      focusRef.current.focus();
    }
  }, []);

  useEffect(async () => {
    try {
      if(loggingInCookie === false){
        setLoggingInCookie(true);
        const refreshResult = await fetch("http://localhost:3000/api/auth/refreshAccount", {
          credentials: "include"
        });
        if(refreshResult) {
          const res = await refreshResult.json();
          if(res?.statusCode === 401){
           // console.log(res);
            console.log("No valid refresh token. User must login");
            setAllowLogin(true);
            setSpinning(false); 
            setLoggingInCookie(false);
          } 
          const  { id, user, invites, refreshToken } = res;
          if(refreshToken === true) dispatch(setRefreshExpire(Date.now() + 875000)); 
          if(false === validateAccountDetails(id, user, invites)){
            setSpinning(false); 
            setLoggingInCookie(false);
            return;
          }
          addAccountToStore({ user: user, invites: invites });
          dispatch(login());
          console.log("Successfully logged in user " + user?.tagName);
          setSpinning(false);
          setLoggingInCookie(false);
       }
      }
    } catch(err) {
      console.log("No valid refresh token. User must login", err);
      setAllowLogin(true); 
      setLoggingInCookie(false);
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
      dispatch(setTopbarMessage(""));
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
    if(result === false) {
        setError(true);
        setSpinning(false);
        setErrorMsgs(["Invalid Credentials", ...errorMsgs]);
        return;
    }
    const  { id, user, invites, refreshToken } = result;
    if(refreshToken === true) dispatch(setRefreshExpire(Date.now() + 875000)); 
    if(false === validateAccountDetails(id, user, invites)){
          setError(true);
          setSpinning(false);
          setErrorMsgs(["Invalid Credentials", ...errorMsgs]);
          return;
    }
    addAccountToStore({ user: user, invites: invites });
    dispatch(login());
    console.log("Successfully logged in user " + user?.tagName);
    setSpinning(false);
  }

  const addAccountToStore = ({ user, invites }) => {
    dispatch(setEmail(user?.email));
    dispatch(setTagName(user?.tagName));
    dispatch(setId(user?.id));
    user.conversations.map(conv => {
        if(conv.pending !== true){
          dispatch(addConversation({ conversation: conv }));
        }
    });
    user.friends.map(friend => {
      dispatch(addFriend(friend));
    }); 
    if(user.friendRequests && Array.isArray(user?.friendRequests)){   
      for(let request of user?.friendRequests){
        if(request?.recipientId === user?.id){   
          dispatch(addFriendRequest(request))
        } 
      }
    }
    if(invites && Array.isArray(invites)){
      for(let invite of invites){
        if(invite?.accepted === true)
          dispatch(addAcceptedInvite(invite));
        else  
          dispatch(addReceivedInvite(invite));
      }
    }
  }
  return (
    (!account?.loggedIn) ? (
    <Container className="h-100 w-100" fluid>
      <Row className="p-3 mt-5 text-white lead text-center">
        <Col className="p-3 text-center, mx-auto pt-5 mt-5 shadow login-screen-column"> 
          <h2 className="text-white welcome-text" >Welcome to <span className="text-danger">Project Zed</span></h2>
          <h6 className="text-muted font-italic welcome-subtext">Secured by you, for you</h6>
            {
              (loggingInCookie) 
                ? (
                  <Container fluid className="text-center">
                     <Row className="text-center pb-2"><Col className="text-center"><h6>Welcome Back!</h6></Col></Row>
                     <Row className="text-center pb-2"><Col className="text-center"><span className="text-muted">Logging Back In!</span></Col></Row>
                     <Row className="text-center pt-4 pb-2"><Col><Spinner animation="border" className="mb-4 login-spinner" variant="success" /></Col></Row>
                  </Container>)
                : (
                    <div>
                      <InputGroup className="mb-5 mt-3">
                        <FormControl
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
                          className="login-screen-form"
                        />
                      </InputGroup>
                      <InputGroup className="mb-5">
                        <FormControl
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
                          className="login-screen-form"
                        />
                      </InputGroup>
                      <Container fluid className="border-top border-dark pt-2">   
                        <Row className="mt-3">
                          <Col>               
                            <Button variant="dark" className="mx-auto button-outline-black" onClick={() => document.getElementById("link-create-account").click() }><Link id="link-create-account" className="login-link-button" to="/createAccount">Create&nbsp;Account</Link></Button>
                          </Col>
                        </Row>
                        <Row className="mt-3">
                          <Col>
                              <Button  variant="dark" className="mx-auto button-outline-black " onClick={() => document.getElementById("link-forgot-password").click() }><Link id="link-forgot-password" className="login-link-button" to="/forgotPassword">Forgot&nbsp;Password?</Link></Button>
                          </Col>
                        </Row>
                        <Row className="mt-3 mb-2">
                          <Col>
                            {
                              (spinning) ?  <Spinner animation="border" className="mb-4 logging-in-spinner" variant="success" /> : <Button onClick={submit} size="lg" className="rounded mb-4 mx-auto login-button" variant="outline-success" block disabled={!allowLogin}>Login</Button>
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
                                              <span className="text-success lead font-italic font-weight-bolder logging-in-text">Logging in...</span>
                                            </Col>)
                                          : ""
                            }
                          </Row>
                      </Container>
                    </div>
                  )
              }
        </Col> 
      </Row>
    </Container>)
    : <Redirect to="/home"></Redirect>
  );
}

export default LoginScreen;
