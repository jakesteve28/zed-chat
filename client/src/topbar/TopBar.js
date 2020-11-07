import React, { useEffect, useRef } from 'react'
import { Button, Container, Row, Dropdown, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import './topbar.css'
import useWindowSize from '../sidebar/windowSize';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {
  selectAccount,
  logout
} from '../account/accountSettingsSlice'
import {
  addConversation,
  selectConversations,
  setCurrentConversation
} from '../currentConversation/conversationsSlice'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { FormControl } from 'react-bootstrap'
import { useState } from 'react'
import { selectToken } from '../auth/authSlice';
import { selectSent, selectReceived, acceptedInvites, addSentInvite, addAcceptedInvite, addReceivedInvite } from './inviteSlice';
import io from 'socket.io-client'

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexGrow: 1,
      backgroundColor: "#191919",
      height: "100%"
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      backgroundColor:"#191919"
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    menu : {
      backgroundColor: "#404040"
    }
  }));

  const CustomMenu = React.forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
      const dispatch = useDispatch()
      const [value, setValue] = useState('');
      const token = useSelector(selectToken);
      const { tagName } = useSelector(selectAccount)
      const reqBody = {
        tagName: `${tagName}`
      };
      const sentInvites = useSelector(selectSent)
      const _acceptedInvites = useSelector(acceptedInvites)
      const receivedInvites = useSelector(selectReceived)

      const createConversation = async () => {
        const res = await fetch("http://localhost:3002/api/conversation/create",
          {
            method: "POST",
            body: JSON.stringify(reqBody),
            headers: {
              "Authorization": `Bearer ${token}`,
              "content-type": "application/json"
            }
          }
        )
          const conv = await res.json()
          const reqAddBody = {
            conversationId: `${conv.id}`,
            userTagName: `${tagName}`
          }
          const resAdd = await fetch("http://localhost:3002/api/conversation/addUser", {
            method: "PUT",
            body: JSON.stringify(reqAddBody),
            headers: {
              "Authorization": `Bearer ${token}`,
              "content-type": "application/json"
            }
          })
          const addedConv = await resAdd.json()
          const reqBodyAddOther = {
            conversationId: `${conv.id}`,
            userTagName: `${value}`
          }
          const resAddOther = await fetch("http://localhost:3002/api/conversation/addUser", {
            method: "PUT",
            body: JSON.stringify(reqBodyAddOther),
            headers: {
              "Authorization": `Bearer ${token}`,
              "content-type": "application/json"
            }
          })
          const addedOtherConv = await resAddOther.json()
          console.log(addedOtherConv)
          dispatch(addConversation({ conversation: addedOtherConv }))
          dispatch(setCurrentConversation(addedOtherConv))
      }

      async function test(){
        await createConversation()
      }

      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
        >
          <Container fluid>
            <Row>
              <FormControl
                autoFocus
                className="mx-3 my-2 w-auto text-primary my-form-control"
                style={{ backgroundColor: "#404040"}}
                placeholder="Enter user's tag name"
                onChange={(e) => setValue(e.target.value)}
                value={value}
              />
            </Row>
            <Row>
            <Button onClick={async () => { await test() }} variant="outline-secondary" className="rounded-pill mx-auto my-form-control">
              Start Chat
            </Button>
            </Row>
            <Row>
              <Col>
                {sentInvites.map((el) => {
                  return (
                    <Container>{JSON.stringify(el)}</Container>
                  )
                })}
              </Col>
              <Col>
                {receivedInvites.map((el) => {
                  return (
                    <Container>{JSON.stringify(el)}</Container>
                  )
                })}
                {_acceptedInvites.map((el) => {
                  return (
                    <Container>{JSON.stringify(el)}</Container>
                  )
                })}
              </Col>
            </Row>
          </Container>
          
        </div>
      );
    },
  );

let socket 

export default function TopBar(){
    const token = useSelector(selectToken);
    const socketOptions = {
        transportOptions: {
            polling: {
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    }
    socket = io('http://localhost:42020/invite-server', socketOptions)
    const inputEl = useRef(null);
    const [modalShow, setModalShow] = React.useState(false);
    const size = useWindowSize()
    const classes = useStyles();
    const account = useSelector(selectAccount);
    const dispatch = useDispatch();
    const screenSmall = size.width < 768;
    const sentInvites = useSelector(selectSent)
    const receivedInvites = useSelector(selectReceived)
    const _acceptedInvites = useSelector(acceptedInvites)
    const conversations = useSelector(selectConversations)

    useEffect(async () => {
      if(token){
        const sentInvitesRes = await fetch(`http://localhost:3002/api/invite/sent/${account.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        const sentInvites = await sentInvitesRes.json()
        if(sentInvites && Array.isArray(sentInvites)){
          console.log(sentInvites)
          for(let invite of sentInvites){
            dispatch(addSentInvite(invite))
          }
        }
        const receivedInvitesRes = await fetch(`http://localhost:3002/api/invite/user/${account.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        const receivedInvites = await receivedInvitesRes.json()
        if(receivedInvites && Array.isArray(receivedInvites)){
          for(let invite of receivedInvites){
            console.log(receivedInvites)
            if(invite.accepted === true)
              dispatch(addAcceptedInvite(invite))
            else  
              dispatch(addReceivedInvite(invite))
          }
        }
      } 
    }, [token])
    useEffect(() => {
      socket.on('convInvite', (msg) => {
        try {
          const inv = JSON.parse(msg)
          console.log(inv)
          if(inv.invite.recipientId === account.id){
            if(conversations){
              if(0 === conversations.filter(el => el.id === inv.invite.conversationId).length){
                 dispatch(addReceivedInvite(inv.invite))
              }
            }
          } 
        } catch(err) {
          console.log("Receive Invite Error" + err)
        }
      })
      socket.on('accepted', (msg) => {

      })
      
      return () => {
        if(socket){
          socket.off('convInvite')
          socket.off('accepted')
        }
      }
    }, [])
    
    const sendInvite = () => {
      socket.emit('sendInvite', JSON.stringify({

      }))
    }
    const sendAcceptInvite = () => {
      socket.emit('acceptInvite', JSON.stringify({

      }))
    }
    return (
      <>
        <CssBaseline>
        <AppBar position="fixed"  className={classes.appBar}>
            <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            </IconButton>
            <Typography className={classes.title}>
               <Container fluid>
                  <Row>
                    {
                    (account.loggedIn && !screenSmall) ? 
                          (
                            <Dropdown style={{ backgroundColor: "#191919 "}} >
                            <Dropdown.Toggle as="button" className="rounded-pill btn btn-outline-primary">New Chat</Dropdown.Toggle>
                            <Dropdown.Menu style={{ backgroundColor: "#191919 "}} as={CustomMenu} className="my-dropdown">
                          </Dropdown.Menu>
                          </Dropdown>
                       )
                      : ""
                    }
                    {
                        (account.loggedIn && screenSmall) ?
                          (
                            <Button style={{backgroundColor: "#191919", border: "none"}}><ArrowBackIcon></ArrowBackIcon></Button>
                          )
                        : ""
                    }        
                  </Row>
               </Container>
            </Typography>
            <Typography variant="h4" className={classes.title}>
                <span style={{ opacity: 0.87 }} className="text-white font-weight-bolder"></span>
            </Typography>
            {
              (!account.loggedIn) ? (<Link className="rounded-pill btn btn-outline-primary mr-5 rounded-pill" renderas={Button} to="/login">
              Login
            </Link>) : ""
            }
            {(account.loggedIn) ? (
            <Dropdown variant="secondary" style={{ backgroundColor: "#404040", position: "relative", zIndex: "10"}}>              
              <Dropdown.Toggle className="dropdown-toggle text-white" style={{ border:" none", backgroundColor: "#191919"}} as="button" id="dropdown-custom-2"><MoreVertIcon></MoreVertIcon></Dropdown.Toggle>
              <Dropdown.Menu style={{ backgroundColor: "#404040"} } className="my-dropdown text-white">
                <Dropdown.Item  className="text-white" style={{ backgroundColor: "#404040"}} as="button" onClick={() => document.querySelector("#contactsMenu").click()}><Link id="contactsMenu" as="button" style={{ textDecoration: 'none', color: "white" }} to="/contacts">View Contacts</Link></Dropdown.Item>
                <Dropdown.Item  className="text-white" style={{ backgroundColor: "#404040"}} as="button" onClick={() => document.querySelector("#accountSettings").click()}><Link id="accountSettings" as="button" style={{ textDecoration: 'none', color: "white" }} to="/settings">Account</Link></Dropdown.Item>
                <Dropdown.Item  className="text-white" style={{ backgroundColor: "#404040"}} as="button" onClick={() => { dispatch(logout()) }}><Link style={{ textDecoration: 'none', color: "white" }} to="/login">Logout</Link></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            ) : ""}
            </Toolbar>
        </AppBar>
        </CssBaseline>
        </>
    )
}