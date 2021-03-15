import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux'; 
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import { notificationSocket } from '../socket/notificationSocket';
import '../../styles/listitems.css';
import '../../styles/topbar.css';
import { removeAcceptedInvite } from '../../store/slices/inviteSlice';
export function AcceptedInviteListItem({ senderTagname, inviteId }){
    const dispatch = useDispatch();
    const deleteItem = () => {
        if(notificationSocket) {
            console.log(`Emitting delete accepted invite to server for invite with ID ${inviteId}`);
            notificationSocket.emit('deleteInvite', { inviteId: inviteId }, () => {
                console.log("Successfully emitted deleteInvite event to server. Now deleting invite from store.");
                dispatch(removeAcceptedInvite(inviteId)); 
            });
        }
    }
    return (
        <Row className="p-3 accepted-list-item">
            <Col className="text-small text-center my-auto opaque">
                Invite to chat from @{`${senderTagname}`}
            </Col>
            <Col xs="5" className="text-center pr-2 opaque">
                <Button onClick={() => deleteItem()} className="btn-sm mb-1 rounded-pill button-bg delete-invite-button">
                    <Tooltip title="Delete">
                        <DeleteOutlineIcon></DeleteOutlineIcon>
                    </Tooltip>
                </Button> 
            </Col>  
        </Row>
    )
}
AcceptedInviteListItem.propTypes = {
    senderTagname: PropTypes.string,
    inviteId: PropTypes.string
}