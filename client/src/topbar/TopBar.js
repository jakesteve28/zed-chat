import React, { useEffect } from 'react'
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
import { Badge } from '@material-ui/core'
import {
  selectAccount,
  logout,
  clearAccount
} from '../account/accountSettingsSlice'
import {
  addConversation,
  selectConversations,
  selectCurrentConversation,
  setCurrentConversation,
  clearConversations,
  removeConversation,
  setView,
  selectView
} from '../currentConversation/conversationsSlice'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { FormControl } from 'react-bootstrap'
import { useState } from 'react'
import { selectToken, clearAuth } from '../auth/authSlice';
import { selectReceived, acceptedInvites, removeReceivedInvite, addAcceptedInvite, addReceivedInvite, clearInvites } from './inviteSlice';
import io from 'socket.io-client'
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
let socket
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
      const dispatch = useDispatch();
      const [value, setValue] = useState('');
      const token = useSelector(selectToken);
      const { tagName } = useSelector(selectAccount);
      const reqBody = {
        tagName: `${tagName}`
      };
      const account = useSelector(selectAccount);

      const sendInvite = (convId) => {
        if(account && socket){
          socket.emit('sendInvite', JSON.stringify({
            sender: account, userId: value, conversationId: convId
          }))
        } else {
          console.log("Error send accept invite", account, socket)
        }
      }
      // const sendAcceptInvite = (invite) => {
      //   if(invite && account && socket){
      //     socket.emit('acceptInvite', JSON.stringify({
      //       sender: account, userId: value, conversationId: invite.conversationId
      //     }))
      //   } else {
      //     console.log("Error send accept invite", invite, account, socket)
      //   }
      // }

      const createConversation = async () => {
        if(token){
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
          sendInvite(conv.id)
          console.log("Invite sent for conv")
          dispatch(addConversation({ conversation: conv }))
        } else {
          console.log("Cannot create conversation without  token: " + token)
        }
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
            <Button onClick={async () => { await createConversation() }} variant="outline-secondary" className="rounded-pill mx-auto my-form-control">
              Send Chat Invite
            </Button>
            </Row>
          </Container>        
        </div>
      );
    },
  );

export default function TopBar(){
    const token = useSelector(selectToken);
    const size = useWindowSize()
    const classes = useStyles();
    const account = useSelector(selectAccount);
    const dispatch = useDispatch();
    const screenSmall = size.width < 768;
    const receivedInvites = useSelector(selectReceived)
    const _acceptedInvites = useSelector(acceptedInvites)
    const conversations = useSelector(selectConversations)
    const currentConversation = useSelector(selectCurrentConversation)
    const view = useSelector(selectView)
    useEffect(() => {
      const socketOptions = {
        transportOptions: {
            polling: {
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                    }
                }
            }
        }
      if(account.loggedIn === true){
        socket = io('http://localhost:42020/invite-server', socketOptions)
          socket.on('connect', () => {
            console.log("Connected to invite socket")
          })
          socket.on('convInvite', (msg) => {
            try {
              if(msg.invite.recipientId === account.id && msg.conv){
                console.log(msg.conv)
                console.log("Conv invite for user " + msg.invite.recipientId)
                if(conversations){
                  if(0 === conversations.filter(el => el.id === msg.invite.conversationId).length){
                    msg.conv.pending = true
                    dispatch(addConversation({ conversation: msg.conv }))
                    dispatch(addReceivedInvite(msg.invite))
                    console.log("Received invite: " + msg.invite)
                  }
                }
              } 
            } catch(err) {
              console.log("Receive Invite Error" + err)
            }
          })
          socket.on('accepted', (msg) => {
              if(msg.conv && msg.invite && msg.invite.senderId === account.id){
                console.log("Conv invite accepted by user " + msg.invite.recipientId)
                dispatch(removeConversation({ id: msg.conv.id }))
                dispatch(addConversation({ conversation: msg.conv }))
              }
          })
          socket.on('error', (msg) => {
            console.log("error", msg)
            console.log(msg)
          })
          return () => {
            if(socket){
              socket.off('convInvite')
              socket.off('accepted')
            }
          }
        }
    }, [])

    const logoutAccount = () => {
      dispatch(logout())
      dispatch(clearAccount())
      dispatch(clearAuth())
      dispatch(clearConversations())
      dispatch(clearInvites())
      console.log("Successfully logged out")
    }

    const sendAccept = (inviteId, userId, conversationId) => {
      if(socket){
        socket.emit("acceptInvite", JSON.stringify({ inviteId: inviteId, userId: userId, conversationId: conversationId }))
      }
      const invite = receivedInvites.filter(inv => inv.id === inviteId)[0]
      if(invite){
        dispatch(removeReceivedInvite(inviteId))
        dispatch(addAcceptedInvite(invite))
        const conversation = JSON.parse(JSON.stringify(conversations.filter(conv => conv.id === conversationId)[0]))
        if(conversation){
          conversation.users.push(account)
          conversation.pending = false
          let str = ``
          for(let user of conversation.users) str += `@${user.tagName} `
          conversation.conversationName = `Chat with ${str}`
        }
        dispatch(removeConversation(conversationId))
        dispatch(addConversation({ conversation: conversation }))
      }
    }

    function InviteReceived(props){
      const account = useSelector(selectAccount);
      return (
      <Row className="border-bottom border-secondary p-3">
        <Col className="font-italic text-sm text-white text-center my-auto" style={{ opacity: 0.67 }}>
            Invite to chat with user ID {props.sender}
        </Col>
        <Col xs="5" className="text-center"  style={{ opacity: 0.67 }}>
          <Button variant="outline-success" className="btn-sm mb-1 rounded-pill" onClick={() => { sendAccept(props.inviteId, account.id, props.convId) }}>Accept</Button> 
          <Button variant="outline-warning" className="btn-sm rounded-pill">Decline</Button>
        </Col>  
      </Row>
      )
    }
    function InviteAccepted(props){
      const conversations = useSelector(selectConversations)
      const conv = conversations.filter(conv =>  conv.id === props.convId)[0]
      return (
        <Row className="border-bottom border-secondary p-3">
        <Col className="font-italic text-sm text-white text-center my-auto" style={{ opacity: 0.87 }}>
             Invite to chat with user ID {props.sender}
        </Col>
        <Col xs="5" className="text-center pr-2"  style={{ opacity: 0.67 }}>
          <Button variant="outline-success" className="btn-sm mb-1 rounded-pill" onClick={() => { dispatch(setView(false)); dispatch(setCurrentConversation(conv))}}>Accepted</Button> 
        </Col>  
      </Row>
      )
    }
    // function InviteDeclined(props){
    //   return (
    //     <Row className="border-bottom border-secondary p-3">
    //       <Col className="font-italic text-sm text-white text-center my-auto" style={{ opacity: 0.87 }}>
    //           Invite to chat with user ID {props.sender}
    //       </Col>
    //       <Col xs="5" className="text-center pr-2"  style={{ opacity: 0.67 }}>
    //         <Button variant="outline-warning" disabled className="btn-sm rounded-pill">Declined</Button>
    //       </Col>  
    //     </Row>
    //   )
    // }
    return (
        <CssBaseline>
        <AppBar position="fixed"  className={classes.appBar}>
            <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            </IconButton>
            <Typography component={'span'} className={classes.title}>
               <Container fluid>
                  <Row>
                    {
                    (account.loggedIn && !screenSmall) ? 
                          (
                            <>
                            <Dropdown style={{ backgroundColor: "#191919 "}} >
                            <Dropdown.Toggle as="button" style={{opacity: 0.87 }} className="rounded-pill btn btn-outline-primary">New Chat</Dropdown.Toggle>
                            <Dropdown.Menu style={{ backgroundColor: "#191919 "}} as={CustomMenu} className="my-dropdown">
                          </Dropdown.Menu>
                          </Dropdown>
                          <Dropdown className="ml-3 p-1" style={{ backgroundColor: "#191919 "}} >
                            <Dropdown.Toggle as="button" style={{ border: "none", color: "white", backgroundColor: "#191919" }} className="font-weight-bold rounded-pill ml-2">
                              <Badge color="primary" variant="dot">
                                <NotificationsNoneIcon></NotificationsNoneIcon>
                              </Badge>
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ backgroundColor: "#191919 "}} className="my-dropdown my-dropdown-">
                            <Dropdown.ItemText className=" text-center border-bottom font-normal border-white text-white" style={{ opacity: 0.87 }}>Invites to Chat</Dropdown.ItemText>
                              <Container fluid style={{ maxHeight: "250px", minHeight: "250px", minWidth: "250px", overflowY: "scroll"}}>
                                    {receivedInvites.map((el) => {
                                      return (
                                        <InviteReceived sender={`${el.senderId}`} key={`${Math.random()}`} convId={`${el.conversationId}`} inviteId={`${el.id}`}></InviteReceived>
                                      )
                                    })}
                                    {_acceptedInvites.map((el) => {
                                        return (
                                          <InviteAccepted sender={`${el.senderId}`} key={`${Math.random()}`} convId={`${el.conversationId}`} inviteId={`${el.id}`}></InviteAccepted>
                                        )
                                      })
                                    }
                              </Container>
                          </Dropdown.Menu>
                          </Dropdown>
                          </>
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
            <Typography component={'span'} variant="h4" className={classes.title}>
                <span style={{ opacity: 0.67 }} className="text-white lead">{(currentConversation && currentConversation.conversationName && !view) ? `${currentConversation.conversationName}` : "" }</span>
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
                <Dropdown.Item  className="text-white" style={{ backgroundColor: "#404040"}} as="button" onClick={() => document.querySelector("#accountSettings").click()}><Link id="accountSettings" as="button" style={{ textDecoration: 'none', color: "white" }} to="/settings">Account</Link></Dropdown.Item>
                <Dropdown.Item  className="text-white" style={{ backgroundColor: "#404040"}} as="button" onClick={() => { logoutAccount() }}><Link style={{ textDecoration: 'none', color: "white" }} to="/login">Logout</Link></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            ) : ""}
            </Toolbar>
        </AppBar>
        </CssBaseline>
    )
}