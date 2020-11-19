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
import AddIcon from '@material-ui/icons/Add';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
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
import {
  selectFriends,
  selectFriendRequests,
  addFriend,
  removeFriend,
  addFriendRequest,
  removeFriendRequest,
  clearFriends
} from '../account/friendsSlice'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { FormControl } from 'react-bootstrap'
import { useState } from 'react'
import { selectToken, clearAuth } from '../auth/authSlice';
import { selectReceived, acceptedInvites, removeReceivedInvite, addAcceptedInvite, addReceivedInvite, clearInvites } from './inviteSlice';
import io from 'socket.io-client'
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import regex from '../regex'
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
      const [friendTag, setFriendTag] = useState('')
      const [error, setError] = useState(false)
      const [errorMsg, setErrorMsg] = useState('')
      const token = useSelector(selectToken);
      const { tagName } = useSelector(selectAccount);
      const friends = useSelector(selectFriends)
      const reqBody = {
        tagName: `${tagName}`
      };
      const account = useSelector(selectAccount);

      useEffect(() => {
        if(socket) {
          socket.on('error', (msg) => {
            console.log("error", msg)
            setError(true)
            setErrorMsg(`${msg.msg}`)
          })
        }
      }, [socket])

      const sendInvite = (convId) => {
        setError(false)
        setErrorMsg('')
        if(regex.tagName.test(value) == false){
            console.log("Error send accept invite", account, socket)
            setErrorMsg("Invalid Tag Name")
            setError(true)
            return
        }
        if(account && socket){
          socket.emit('sendInvite', JSON.stringify({
            sender: account, userId: value, conversationId: convId
          }))
        } else {
          console.log("Error send invite", account, socket)
        }
      }
      
      const createConversation = async () => {
        setError(false)
        setErrorMsg('')
        if(friends) {
          if(friends.filter(fr => fr.tagName === `${value}`).length < 1){
              console.log("Error send conversation request", account, socket) 
              setError(true)
              setErrorMsg("Friend does not exist")
          } else {
            if(token){
              const res = await fetch("http://localhost:3000/api/conversation/create",
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
            console.log("Cannot create conversation without token: " + token)
          }
        }
        } else {
              console.log("Error send conversation request", account, socket) 
              setError(true)
              setErrorMsg("Friend's list does not exist")
        }
      }

      const sendFriendRequest = async () => {
        if(token){
          setError(false)
          if(regex.tagName.test(friendTag) == false){
              console.log("Error send friend request")
              setErrorMsg("Invalid Tag Name")
              setError(true)
              return
          }
          if(account && socket){
            if(account.tagName === friendTag){
              console.log("Cannot send friend request to self", account.tagName, friendTag) 
              setError(true)
              setErrorMsg("Cannot send friend request to self")
            } else {
              socket.emit('sendFriendRequest', JSON.stringify({
                senderId: account.id,
                recipientId: friendTag
              }))
            }
          } else {
            console.log("Error send friend request", account, socket) 
            setError(true)
            setErrorMsg("Connection error")
          }
        } else {
          console.log("Cannot send friend request without token: " + token)
          setError(true)
          setErrorMsg("Authentication error")
        }
      }
      return (
        <div
          ref={ref}
          style={{minWidth: "300px"}}
          className={className}
          aria-labelledby={labeledBy}
        >
          <Container fluid>
            <Row className="pt-2 mb-2 mt-2 text-center lead text-white" style={{ opacity: 0.87 }}>
              <Col>
                Start a conversation
              </Col>
            </Row>
            <Row className="mb-2 mt-2">
              <Col className="text-center">
                <FormControl               
                  className="mx-auto p-2 m-2 w-auto text-white text-center my-form-control rounded-pill"
                  style={{ backgroundColor: "#404040", minWidth: "200px"}}
                  placeholder="Enter friend's @tagname"
                  onChange={(e) => setValue(e.target.value)}
                  value={value}
                />
              </Col>
            </Row>
            <Row className="mb-2 mt-2">
              <Button onClick={async () => { await createConversation() }} variant="outline-secondary" className="rounded-pill mx-auto my-form-control-button">
                Send Invite
              </Button>
            </Row>
            <Row className ='mb-2 mt-2 border-secondary border-bottom' style={{ minHeight: 20}}>
            </Row>
            <Row className="mb-2 mt-4 text-center lead text-white">
              <Col>
                Add a friend
              </Col>
            </Row>
            <Row className="mb-2 mt-2 text-center text-primary" style={{ opacity: 0.87 }}>
              <Col className="text-center">
                <FormControl            
                  className="mx-auto p-2 m-2 w-auto text-white text-center my-form-control rounded-pill"
                  style={{ backgroundColor: "#404040", minWidth: "200px"}}
                  placeholder="Enter user's @tagname"
                  onChange={(e) => setFriendTag(e.target.value)}
                  value={friendTag}
                />
              </Col>
            </Row>
            <Row className="mb-2 mt-2 pb-3">
              <Button onClick={async () => { await sendFriendRequest() }} variant="outline-secondary" className="rounded-pill mx-auto my-form-control-button">
                  Send Friend Request
              </Button>
            </Row>
            {
              (error) ? (<Row>
                <Col className="small text-center text-danger font-italic">
                    {errorMsg}
                </Col>
              </Row>) : ""
            }
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
    const friendRequests = useSelector(selectFriendRequests)
    const friends = useSelector(selectFriends)

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
        socket = io('http://localhost:3002/invite-server', socketOptions)
          socket.on('connect', () => {
            console.log("Connected to invite socket")
          });
          socket.on('convInvite', (msg) => {
            try {
              if(msg.invite.recipientId === account.id && msg.conv){
                console.log(msg.conv)
                console.log("Conv invite for user " + msg.invite.recipientId)
                if(conversations){
                  if(0 === conversations.filter(el => el.id === msg.invite.conversationId).length){
                    msg.conv.pending = true
                    dispatch(addConversation({ conversation: msg.conv }))
                    msg.invite.sender = msg.user
                    console.log(msg)
                    dispatch(addReceivedInvite(msg.invite))
                    console.log("Received invite: " + msg.invite)
                  }
                }
              } 
            } catch(err) {
              console.log("Receive Invite Error" + err)
            }
          });
          socket.on('accepted', (msg) => {
              if(msg.conv && msg.invite && msg.invite.senderId === account.id){
                console.log("Conv invite accepted by user " + msg.invite.recipientId)
                dispatch(removeConversation({ id: msg.conv.id }))
                dispatch(addConversation({ conversation: msg.conv }))
              }
          });       
          socket.on('friendRequestSent', (msg) => {
              if(msg && msg.friendRequest){
                if(msg.friendRequest.recipientId === account.id){
                  console.log("Friend request received from user " + JSON.stringify(msg))
                  dispatch(addFriendRequest(msg.friendRequest))
                }
                if(msg.friendRequest.sender.id === account.id){
                  console.log("Friend request delivered to user " + JSON.stringify(msg))
                  dispatch(addFriendRequest(msg.friendRequest))
                }      
              }
          });
          socket.on('friendRequestDeclined', (msg) => {
            if(msg && msg.friendRequest){
              if(msg.friendRequest.recipientId === account.id){ 
                console.log("Friend request decline delivered")  
                dispatch(removeFriendRequest(msg.friendRequest.id))
              }
              if(msg.friendRequest.sender.id === account.id){
                console.log("Friend request declined")
                dispatch(removeFriendRequest(msg.friendRequest.id))
              }    
            }
          });
          socket.on('friendAdded', (msg) => {
            if(msg && msg.friendRequest){
              console.log(msg)
              if(msg.friendRequest.recipientId === account.id){ 
                const sender = msg.friendRequest.sender
                console.log("Friend Added", sender)   
                dispatch(addFriend(sender))
                dispatch(removeFriendRequest(msg.friendRequest.id))
              }
              if(msg.friendRequest.sender.id && msg.friendRequest.sender.id === account.id){
                const acceptor = msg.acceptor
                console.log("Friend added", acceptor)
                dispatch(addFriend(acceptor))
                dispatch(removeFriendRequest(msg.friendRequest.id))
              }    
            }
          });
          socket.on('friendRemoved', (msg) => {
            if(msg && msg.exFriend1 && msg.exFriend2){
               if(account.id === msg.exFriend1.id) {
                  dispatch(removeFriend(msg.exFriend2.id))
                  console.log("Friend removed", msg.exFriend2)
               }
               if(account.id === msg.exFriend2.id) {
                  dispatch(removeFriend(msg.exFriend1.id))
                  console.log("Friend removed", msg.exFriend1)
               }
            }
          });
          return () => {
            if(socket){
              socket.off('convInvite')
              socket.off('accepted')
              socket.off('friendRequestSent')
              socket.off('friendRequestDeclined')
              socket.off('friendAdded')
              socket.off('friendRemoved')
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
      dispatch(clearFriends())
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
        try {
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
      } catch(err){
        console.log("Error adding conversation")
      }
      }
    }

    function InviteReceived(props){
      const account = useSelector(selectAccount);
      const sender = props.sender
      let sndr
      if(sender.tagName) {
        sndr = sender.tagName
      } else {
        sndr = sender
      }
      if(sndr.length > 10){
        sndr = sndr.slice(0, 9)
        sndr += " ... "
      }
      return (
      <Row className="border-bottom border-secondary p-3">
        <Col className="font-italic text-sm text-white text-center my-auto" style={{ opacity: 0.67 }}>
            Invite to chat with user {`${sndr}`}
        </Col>
        <Col xs="5" className="text-center"  style={{ opacity: 0.67 }}>
          <Button style={{ backgroundColor: "#191919", border: "none"  }} className="btn-sm mb-1 rounded-pill" onClick={() => { sendAccept(props.inviteId, account.id, props.convId) }}>Accept</Button> 
          <Button style={{ backgroundColor: "#191919", border: "none"  }} className="btn-sm rounded-pill">Decline</Button>
        </Col>  
      </Row>
      )
    }

    function Friend(props){
      return (
        <Row className="p-3">
          <Col className="font-italic text-sm text-white text-center my-auto" style={{ opacity: 0.67 }}>
              @{props.tagName}
          </Col>
        </Row>
      )
    }

    const acceptFriendRequest = (id, recipientId) => {
      console.log("Accept Friend Request Clicked", id, recipientId, account.id)
      if(socket && account){
        if(recipientId === account.id){
          socket.emit("acceptFriendRequest", JSON.stringify({ friendRequestId: id }));
        }
      }
    }

    function FriendRequest(props) {
      const account = useSelector(selectAccount)

      return (props.sender.tagName === account.tagName) 
      ? 
      ""
      :
      (
        <Row className="border-bottom border-secondary p-2">
          <Col className="text-sm text-white text-center my-auto" style={{ opacity: 0.87 }}>
              Friend request from @{props.sender.tagName}
          </Col>
          
          <Col xs="5" className="text-center p-2"  style={{ opacity: 0.67 }}>
            <Button className="btn-sm mb-1 rounded-pill" style={{ border: "none", color: "white", backgroundColor: "#191919" }} onClick={() => { acceptFriendRequest(props.requestId, props.recipientId) }}>Accept</Button> 
            <Button className="btn-sm rounded-pill" style={{ border: "none", color: "white", backgroundColor: "#191919" }}>Decline</Button>
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
             Invite to chat with user {(props.sender.length > 10) ? `${props.sender.substring(0, 10)}...` : `${props.sender}`}
        </Col>
        <Col xs="5" className="text-center pr-2"  style={{ opacity: 0.67 }}>
          <Button className="btn-sm mb-1 rounded-pill" style={{ backgroundColor: "#191919", border: "none"  }} onClick={() => { dispatch(setView(false)); dispatch(setCurrentConversation(conv))}}>Accepted</Button> 
        </Col>  
      </Row>
      )
    }

    return (
        <CssBaseline>
        <AppBar position="fixed"  className={classes.appBar}>
            <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            </IconButton>
            <Typography component={'span'} className={classes.title}>
               <Container fluid>
                  <Row className="text-center">
                    {
                    (account.loggedIn && !screenSmall) ? 
                          (
                            <>
                            <Dropdown style={{ backgroundColor: "#191919 "}} >
                            <Dropdown.Toggle as="button" style={{ border: "none", color: "white", backgroundColor: "#191919" }} className="mt-1 font-weight-bold rounded-pill ml-2">
                              <AddIcon></AddIcon>
                            </Dropdown.Toggle>                           
                          <Dropdown.Menu style={{ backgroundColor: "#191919 ", minWidth: "400px"}} as={CustomMenu} className="my-dropdown">
                          </Dropdown.Menu>
                          </Dropdown>       
                          <Dropdown className="ml-3 p-1" style={{ backgroundColor: "#191919 "}} >
                            <Dropdown.Toggle as="button" style={{ border: "none", color: "white", backgroundColor: "#191919" }} className="font-weight-bold rounded-pill ml-2">
                              {
                                (receivedInvites.length > 1|| friendRequests.length > 1) 
                                ? 
                                <Badge color="white" overlap="circle" badgeContent=" " variant="dot">
                                  <NotificationsNoneIcon></NotificationsNoneIcon>
                                </Badge> 
                                : 
                                <NotificationsNoneIcon></NotificationsNoneIcon>
                              }
                            </Dropdown.Toggle>       
                            <Dropdown.Menu style={{ backgroundColor: "#191919 ", minWidth: "300px" }} className="my-dropdown my-dropdown-">
                            <Dropdown.ItemText className=" text-center border-bottom font-normal border-white text-white" style={{ opacity: 0.87 }}>Notifications</Dropdown.ItemText>
                              <Container fluid style={{ maxHeight: "250px", minHeight: "250px", minWidth: "250px", overflowY: "scroll"}}>
                                    {friendRequests.filter(map => map.recipientId === account.id).map((el) => {
                                      if(el && el.accepted === false && el.cancelled === false && el.sender.id !== account.id){
                                        return (
                                          <FriendRequest requestId={el.id} recipientId={el.recipientId} sender={el.sender} key={`${el.id}`}></FriendRequest>
                                        )
                                      }                          
                                    })}
                                    {receivedInvites.map((el) => {
                                      return (
                                        <InviteReceived sender={(el.sender) ? el.sender : `${el.senderId}`} key={`${Math.random()}`} convId={`${el.conversationId}`} inviteId={`${el.id}`}></InviteReceived>
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
                          <Dropdown className="ml-3 p-1" style={{ backgroundColor: "#191919 "}} >
                            <Dropdown.Toggle as="button" style={{ border: "none", color: "white", backgroundColor: "#191919" }} className="font-weight-bold rounded-pill ml-2">
                                <PeopleAltIcon></PeopleAltIcon>
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ backgroundColor: "#191919 ", minWidth: "300px"}} className="my-dropdown my-dropdown-">
                            <Dropdown.ItemText className=" text-center border-bottom font-normal border-white text-white" style={{ opacity: 0.87 }}>Friends List</Dropdown.ItemText>
                              <Container fluid style={{ maxHeight: "250px", minHeight: "250px", minWidth: "250px", overflowY: "scroll"}}>
                                {friends.map((el) => {
                                  if(el && el.tagName){
                                    return (
                                      <Friend tagName={el.tagName} key={el.id}></Friend>
                                    )
                                  }                          
                                })}
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
              (!account.loggedIn) ? (<Link className="rounded-pill btn btn-outline-primary mr-5 rounded-pill" style={{ opacity: 0.67 }} renderas={Button} to="/login">
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