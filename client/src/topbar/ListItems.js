import React from 'react';
import { Row, Col, Button, Dropdown, Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectAccount } from '../account/accountSettingsSlice';
import { selectConversations } from '../currentConversation/conversationsSlice';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import './listitems.css';
import './topbar.css';
import { notificationSocket } from '../socket/notificationSocket';

export function FriendListItem({ isOnline, tagName  }){
    return (
    <Container className="friend-list-item-row" fluid>
        <Row className="p-3">
            <Col xs="8" className={`${(isOnline) ? "text-success" : "text-danger"} py-auto font-italic text-sm text-center my-auto`} style={{ opacity: 0.67 }}>
                <span className="">@{tagName}</span>
            </Col>
            <Col xs="4" className="text-left">
                <Button className="dropdown-toggle text-white hidden-dropdown-friend-list-item" variant="dark" style={{ maxWidth: "50px", border: "none", backgroundColor: "#303030"}} onClick={() => alert("Go to friend page")}><MoreVertIcon></MoreVertIcon></Button>
            </Col>
        </Row>
      </Container>
    )
  }
  
export function FriendRequestListItem({ sender: { tagName }, requestId, recipientId, }){
    const account = useSelector(selectAccount);

    const acceptFriendRequest = () => {
        alert("Accept friend requet callback")
    }

    return (tagName === account.tagName) ? "" : (
        <Row className="friend-request-list-item p-2">
            <Col className="text-small text-muted text-center my-auto" style={{ opacity: 0.67 }}>
                Friend request from @{tagName}
            </Col>
            <Col xs="5" className="text-center p-2"  style={{ opacity: 0.67 }}>
                <Button className="btn-sm mb-1 rounded-pill" style={{ border: "none", color: "#97fa93", backgroundColor: "#191919", opacity: 0.9 }} onClick={() => { acceptFriendRequest() }}>Accept</Button> 
                <Button className="btn-sm rounded-pill" style={{ border: "none", color: "#bf2700", backgroundColor: "#191919" }} onClick={() => alert("Decline friend request")}>Decline</Button>
            </Col> 
        </Row>
    )
}
  
export function ReceivedInviteListItem({sender, inviteId, convId }){
    const account = useSelector(selectAccount);
    return (
        <Row className="p-3 invite-hover">
            <Col className="text-small text-muted text-center my-auto" style={{ opacity: 0.67 }}>
                Chat with {`${sender}`.length > 10 ? `${sender}`.substring(0,7) + '...' : `${sender}` }
            </Col>

            <Col xs="5" className="text-center"  style={{ opacity: 0.67 }}>
                <Button  className="btn-sm mb-1 rounded-pill" style={{ border: "none", color: "#97fa93", backgroundColor: "#191919", opacity: 0.9 }} onClick={() => { sendAccept(inviteId, account.id, convId) }}>Accept</Button> 
                <Button className="btn-sm rounded-pill" style={{ border: "none", color: "#bf2700", backgroundColor: "#191919" }}>Decline</Button>
            </Col>  
        </Row>
    )
}
  
export function AcceptedInviteListItem({ convId, sender }){
    const conversations = useSelector(selectConversations)
    const conv = conversations.filter(conv =>  conv.id === convId)[0]
    return (
        <Row className="p-3 invite-hover">
            <Col className="text-small text-muted text-center my-auto" style={{ opacity: 0.67 }}>
                Chat with {`${sender}`.length > 10 ? `${sender}`.substring(0,7) + "..." : `${sender}`}
            </Col>
            <Col xs="5" className="text-center pr-2"  style={{ opacity: 0.67 }}>
                <Button className="btn-sm mb-1 rounded-pill"  style={{ border: "none", backgroundColor: "#191919", opacity: 0.9 }} onClick={() => { dispatch(setView(false)); dispatch(setCurrentConversation(conv))}}>Accepted</Button> 
            </Col>  
        </Row>
    )
}