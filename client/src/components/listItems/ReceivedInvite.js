import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { notificationSocket } from '../socket/notificationSocket';
import './listitems.css';
import '../topbar/topbar.css';
export function ReceivedInviteListItem({ sender, inviteId, convId }) {
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
            <Col className="text-small text-muted text-center my-auto opaque">
                Chat with {`${sender}`.length > 10 ? `${sender}`.substring(0,7) + '...' : `${sender}` }
            </Col>

            <Col xs="5" className="text-center opaque">
                <Button  className="btn-sm mb-1 rounded-pill received-invite-button" onClick={() => { sendAccept() }}>Accept</Button> 
                <Button className="btn-sm rounded-pill received-invite-button-decline">Decline</Button>
            </Col>  
        </Row>
    )
}
ReceivedInviteListItem.propTypes = {
    sender: PropTypes.string, 
    inviteId: PropTypes.string, 
    convId: PropTypes.string
}