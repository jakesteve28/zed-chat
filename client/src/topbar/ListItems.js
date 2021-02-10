import React, {useEffect, useState } from 'react';
import { Row, Col, Button, Dropdown, Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectAccount } from '../account/accountSettingsSlice';
import { selectConversations } from '../currentConversation/conversationsSlice';
import './listitems.css';
import './topbar.css';
import { notificationSocket } from '../socket/notificationSocket';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import GroupAddOutlinedIcon from '@material-ui/icons/GroupAddOutlined';
import NotInterestedOutlinedIcon from '@material-ui/icons/NotInterestedOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import { 
    setView,
    setShowConvList, 
    setCurrentConversation
} from '../currentConversation/conversationsSlice'; 
import { setTopbarMessage } from '../uiSlice';
import { chatSocket } from '../socket/chatSocket';
import useWindowSize from '../sidebar/windowSize';
import ForumIcon from '@material-ui/icons/Forum';
import produce from 'immer';

export function FriendListItem({ account, currentConversation, isOnline, tagName, conversations, history, dispatch }){
    const size = useWindowSize();
    const friendAction = () => {
        if(conversations.length > 0){
            for(let conv of conversations) {
                //Navigate to the first conversation containing them
                if(conv.pending === false){
                    if(location.pathname !== '/home'){
                        history.push('/home');
                    }
                    if(currentConversation.conversationName === conv.conversationName){
                        dispatch(setView(false)); 
                        dispatch(setShowConvList(false));
                        break; 
                    }
                    if(conv && conv.conversationName !== '' && size.width > 768 && (currentConversation.conversationName !== conv.conversationName)){
                        dispatch(setTopbarMessage(conv.conversationName));
                    }  
                    if(conv && conv.conversationName !== '' && size.width <= 768 && (currentConversation.conversationName !== conv.conversationName)) {
                        dispatch(setTopbarMessage("")); 
                    }
                    dispatch(setView(false))
                    dispatch(setCurrentConversation({ conversation: conv }));
                    dispatch(setShowConvList(false));
                    if(chatSocket){
                        chatSocket.emit('setCurrentConversation', { user: account, conversationId: conv.id }, 
                        () => console.log("Emitted setCurrentConversation successfully"));
                    }
                    break;
                }
            }
        } else {
            if(location.pathname){
                history.push('/newConversation');
            }
        }
    }
    return (
        <Container className="friend-list-item-row" fluid>
            <Row className="p-3">
                <Col xs="8" className={`${(isOnline) ? "text-success" : "text-danger"} py-auto font-italic text-sm text-center my-auto`} style={{ opacity: 0.67 }}>
                    <span className="">@{tagName}</span>
                </Col>
                <Col xs="4" className="text-left">
                    <Button className="dropdown-toggle text-white hidden-dropdown-friend-list-item" variant="dark" style={{ maxWidth: "50px", border: "none", backgroundColor: "#303030"}} onClick={() => friendAction()}><ForumIcon></ForumIcon></Button>
                </Col>
            </Row>
        </Container>
    )
  }
  
export function FriendRequestListItem({ requestId, tagName }){
    const account = useSelector(selectAccount);
    const acceptFriendRequest = () => {
        if(notificationSocket){
            console.log("Emitted acceptFriendRequest");
            notificationSocket.emit("acceptFriendRequest", {
                friendRequestId: requestId 
            }, () => {
                console.log("Successfully emitted accept friend request");
            });
        }
    }
    return (tagName === account.tagName) ? "" : (
        <Row className="friend-request-list-item p-2">
            <Col className="text-small text-center my-auto" style={{ opacity: 0.67 }}>
                Friend request from @{tagName}
            </Col>
            <Col xs="5" className="text-center p-2"  style={{ opacity: 0.67 }}>
                <Button className="button-bg mb-1 rounded-pill" style={{ border: "none", color: "#97fa93", backgroundColor: "#191919", opacity: 0.9 }} onClick={() => { acceptFriendRequest() }}>
                    <Tooltip title="Accept">
                        <GroupAddOutlinedIcon></GroupAddOutlinedIcon>
                    </Tooltip>
                </Button> 
                <Button className="button-bg rounded-pill" style={{ border: "none", color: "#bf2700", backgroundColor: "#191919" }} onClick={() => alert("Decline friend request")}>
                    <Tooltip title="Decline">
                        <NotInterestedOutlinedIcon></NotInterestedOutlinedIcon>
                    </Tooltip>
                </Button>
            </Col> 
        </Row>
    )
}
  
export function ReceivedInviteListItem({sender, inviteId, convId }){
    const account = useSelector(selectAccount);
    const sendAccept = () => {
        if(notificationSocket){
            console.log(`Attempting to emit acceptInvite event to server for invite with id ${inviteId}`)
            notificationSocket.emit('acceptInvite', { inviteId: inviteId, conversationId: convId}, () => {
                console.log(`Successfully emitted acceptInvite event to server for invite with id ${inviteId}`)
            });
        }
    }
    return (
        <Row className="p-3 invite-hover">
            <Col className="text-small text-muted text-center my-auto" style={{ opacity: 0.67 }}>
                Chat with {`${sender}`.length > 10 ? `${sender}`.substring(0,7) + '...' : `${sender}` }
            </Col>

            <Col xs="5" className="text-center"  style={{ opacity: 0.67 }}>
                <Button  className="btn-sm mb-1 rounded-pill" style={{ border: "none", color: "#97fa93", backgroundColor: "#191919", opacity: 0.9 }} onClick={() => { sendAccept() }}>Accept</Button> 
                <Button className="btn-sm rounded-pill" style={{ border: "none", color: "#bf2700", backgroundColor: "#191919" }}>Decline</Button>
            </Col>  
        </Row>
    )
}
  
export function AcceptedInviteListItem({ convId, sender }){
    const conversations = useSelector(selectConversations);
    const [tag, setTag] = useState("");
    useEffect(() => {
        let friend;
        if(conversations && Array.isArray(conversations)) {
            for(let conv of conversations){
                for(let user of conv.users){
                    if(user.id === sender){
                        friend = JSON.parse(JSON.stringify(user));
                        break;
                    }
                }
            }
        }
        if(friend.tagName)
            setTag(friend.tagName);
    }, []);
    const deleteItem = () => {
        alert("Todo")
    }
    return (
        <Row className="p-3 accepted-list-item">
            <Col className="text-small text-center my-auto" style={{ opacity: 0.67 }}>
                Chat with {`${tag}`.length > 10 ? `${tag}`.substring(0,7) + "..." : `${tag}`}
            </Col>
            <Col xs="5" className="text-center pr-2"  style={{ opacity: 0.67 }}>
                <Button onClick={() => deleteItem()} className="btn-sm mb-1 rounded-pill button-bg"  style={{ border: "none", backgroundColor: "#191919", opacity: 0.9 }}>
                    <Tooltip title="Delete">
                        <DeleteOutlineIcon></DeleteOutlineIcon>
                    </Tooltip>
                </Button> 
            </Col>  
        </Row>
    )
}