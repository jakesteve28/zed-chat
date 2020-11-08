import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, InputGroup, FormControl, Container, Row, Col } from 'react-bootstrap'
import { Redirect, Link } from 'react-router-dom'

import './loginscreen.css'

import {
  setToken
} from '../auth/authSlice';

import {
  addConversation,
  setCurrentConversation
} from '../currentConversation/conversationsSlice'

import {
  setId,
  setFirstName,
  setLastName,
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

function LoginScreen() {
    async function getAuthToken(userName, password){
    const bd = {
      tagName: `${userName}`,
      password: `${password}`
    }
    const res = await fetch("http://localhost:3002/api/auth/login", {
      body: JSON.stringify(bd),
      headers: { "content-type": "application/json" },
      method: "POST"
    })
    const body = await res.json();
    console.log(body)
    if(body.statusCode === 401 || body.statusCode === 400){
        setErrorMsg("Wrong Username/Password")
        return;
    }
    if(body.statusCode === 500){
        setErrorMsg("Server Error")
        return;
    }
    const bdy = body
    if(bdy.access_token && bdy.id){
      const authToken = bdy.access_token;
      const id = bdy.id;
      //console.log("Logged in with Auth Token ", authToken, id)
      return { authToken, id }
    } else {
      console.log(bdy)
    }
  }
  async function getAccount(id, authToken){
      const account = await fetch(`http://localhost:3002/api/users/${id}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      })
      const bodyAcc = await account.json();
      if(bodyAcc.statusCode === 401){
            setErrorMsg("Wrong Username/Password")
            return;
      }
      if(bodyAcc.statusCode === 500){
            setErrorMsg("Wrong Username/Password")
            return;
      }
      return bodyAcc
  }
  const [userName, _setUserName] = useState("");
  const [password, _setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("")
  const dispatch = useDispatch()
  const account = useSelector(selectAccount)
  const submit = async () => {
  try {
    const { id, authToken } = await getAuthToken(userName, password)
    const bodyAcc = await getAccount(id, authToken)
    dispatch(setToken(`${authToken}`))
    dispatch(setFirstName(bodyAcc.firstName))
    dispatch(setLastName(bodyAcc.lastName))
    dispatch(setEmail(bodyAcc.email))
    dispatch(setTagName(bodyAcc.tagName))
    dispatch(setId(id))
    bodyAcc.conversations.map(conv => {
      dispatch(addConversation({conversation: conv}))
      return conv
    })
    dispatch(setCurrentConversation(bodyAcc.conversations[0]))
    dispatch(login())
    const sentInvitesRes = await fetch(`http://localhost:3002/api/invite/sent/${id}`, {
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      }
    })
    if(sentInvitesRes.status !== 200){
      throw Error("Error fetching sent invites from user")
    }
    const sentInvites = await sentInvitesRes.json()
    if(sentInvites && Array.isArray(sentInvites)){
      console.log("Sent Invites: " + JSON.stringify(sentInvites))
      for(let invite of sentInvites){
        dispatch(addSentInvite(invite))
      }
    }
    const receivedInvitesRes = await fetch(`http://localhost:3002/api/invite/user/${id}`, {
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      }
    })
    const receivedInvites = await receivedInvitesRes.json()
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
  } catch(err) {
    console.log("Error: " + err)
  }
  }
    /*
      Fetch all the remaining information
      (Account settings/profile, Conversations+Messages)
      with the auth token, make a refresh cookie (?) and store JWT 
      in a keystore or something

      Set Up the live socket, open the conversations list view

      (Conversation chosen == socket's next room)
    */
    
   // dispatch(setUserName(userName))
  
  // <Modal.Dialog className="mt-5 p-2 border border-0" style={{backgroundColor: "#191919", padding: "-5px"}}>
  // <Modal.Header style={{backgroundColor: "#191919", marginBottom: "-10px"}}>
  //   <Modal.Title className="text-primary" style={{margin: "auto"}}>Welcome to Zed Chat!</Modal.Title>
  // </Modal.Header>

  return (
    (!account.loggedIn) ?
    <Container className="h-100 w-100 text-center" fluid  style={{ backgroundColor: "#191919",  margin: "auto"}}>
    <Row className="mt-5 mb-4">
      <Col className="text-center mt-5"><h2 className="text-white" style={{ opacity: 0.87 }}>Welcome to Ø Chat!</h2></Col></Row>  
    <Row className="p-3 text-white lead text-center" style={{ backgroundColor: "#191919" }}>
    <Col className="text-center"> 
        <InputGroup className="mb-5">
            <FormControl
              style={{marginLeft: "auto", marginRight: "auto", color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px', backgroundColor: "#404040", border: 'none' }}
              placeholder="@Tagname"
              aria-label="@Tagname"
              aria-describedby="basic-addon1"
              onChange={ e => _setUserName(e.target.value) }
            />
          </InputGroup>
          <InputGroup className="mb-5" style={{ marginLeft: "auto", marginRight: "auto"}}>
            <FormControl
              style={{marginLeft: "auto", marginRight: "auto", color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px', backgroundColor: "#404040", border: 'none', }}
              type="password"
              placeholder="Password"
              aria-label="Password"
              aria-describedby="basic-addon1"
              onChange={ e => _setPassword(e.target.value) }
            />
          </InputGroup>
        </Col> 
    </Row>
      <Row>
        <Col className="text-center">
          <span className="text-danger" style={{ opacity: 0.7 }}>{errorMsg}</span>
        </Col>
      </Row>
      <Row>
      <Container fluid>
        <Row className="p-2" style={{backgroundColor: "#191919"}}>
        <Col xs="3"></Col> 
          <Col xs="6">
            <Button style={{ color: "white", opacity: 0.87}} variant=""><Link style={{ textDecoration: 'none', color: "white" }} to="/forgotPassword">Forgot&nbsp;Password?</Link></Button>
            <Button style={{ marginRight: 30, color: "white", opacity: 0.87}} variant=""><Link style={{ textDecoration: 'none', color: "white" }} to="/createAccount">Create&nbsp;Account</Link></Button>
            <Button onClick={submit} style={{ opacity: 0.87 }} size="lg" className="rounded-pill" variant="outline-success">Login</Button>
            </Col>
          <Col xs="3" className="text-left mr-5 mb-2">
          </Col>
        </Row>
      </Container>
      </Row>
    </Container>
    : <Redirect to="/home"></Redirect>
  );
}

export default LoginScreen;
