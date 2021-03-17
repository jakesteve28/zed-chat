import React, { useState } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap'; 
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Tooltip } from '@material-ui/core';
import InsertCommentIcon from '@material-ui/icons/InsertComment';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import { removeReceivedInvite } from '../../store/slices/inviteSlice';
import { notificationSocket } from '../socket/notificationSocket';
import '../../styles/listitems.css';
import '../../styles/topbar.css';

export function ReceivedInviteListItem({ senderTagname, inviteId, convId }) {
    const [accepting, setAccepting] = useState(false); 
    const [declining, setDeclining] = useState(false);
    const dispatch = useDispatch(); 
    const sendAccept = () => {
        setDeclining(true);
        setAccepting(true); 
        if(notificationSocket){
            console.log(`Attempting to emit acceptInvite event to server for invite with id ${inviteId}`)
            notificationSocket.emit('acceptInvite', { inviteId: inviteId, conversationId: convId }, () => {
                console.log(`Successfully emitted acceptInvite event to server for invite with id ${inviteId}`);
                setAccepting(false);
                setDeclining(false);
            });
        }
    }
    const declineInvite = () => {
        setDeclining(true);
        setAccepting(true); 
        console.log("Declining invite with ID", inviteId);
        if(notificationSocket) {
            console.log(`Attempting to emit declineInvite event to server for invite with id ${inviteId}`);
            notificationSocket.emit('declineInvite', { inviteId: inviteId }, () => {
                console.log("Successfully emitted decline invite event to server"); 
                dispatch(removeReceivedInvite(inviteId)); 
                setAccepting(false);
                setDeclining(false);
            }); 
        }
    }
    return (
        <Row className="p-3 accepted-list-item">
            <Col className="text-small text-center my-auto opaque">
                Invite to chat from @{`${senderTagname}`}
            </Col>
            <Col xs="5" className="text-center pr-2 opaque">
                <Tooltip title="Accept Invite">
                    {
                        (accepting) ? <Spinner size="sm" variant="secondary" /> : <Button  className="received-invite-button" onClick={() => { sendAccept() }}><InsertCommentIcon /></Button> 
                    }
                </Tooltip>
                <Tooltip title="Decline Invite">
                    {
                        (declining) ? <Spinner size="sm" variant="danger" /> : <Button onClick={() => declineInvite()} className="btn-sm mb-1 rounded-pill button-bg delete-invite-button"><NotInterestedIcon /></Button> 
                    }
                </Tooltip>
            </Col>  
        </Row>
    )
}
ReceivedInviteListItem.propTypes = {
    senderTagname: PropTypes.string,
    inviteId: PropTypes.string, 
    convId: PropTypes.string
}