import React, { useState } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import GroupAddOutlinedIcon from '@material-ui/icons/GroupAddOutlined';
import NotInterestedOutlinedIcon from '@material-ui/icons/NotInterestedOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import { selectAccount } from '../../store/slices/accountSettingsSlice';
import { notificationSocket } from '../socket/notificationSocket';
import '../../styles/listitems.css';
import '../../styles/topbar.css';

export function FriendRequestListItem({ requestId, tagName }){
    const account = useSelector(selectAccount);
    const [spinning, setSpinning] = useState(false); 
    const [deleteSpinning, setDeleteSpinning] = useState(false); 
    const acceptFriendRequest = () => {
        try {
            if(spinning) return; 
            setSpinning(true);
            if(notificationSocket){
                console.log("Emitting acceptFriendRequest notification");
                notificationSocket.emit("acceptFriendRequest", {
                    friendRequestId: requestId 
                }, () => {
                    console.log("Successfully emitted accept friend request.");
                });
            }
            setSpinning(false);
        } catch (err) {
            console.error(`Error while sending accept friend request notification to server | ${err.message}`);
            setSpinning(false);
        }
    }
    const declineFriendRequest = () => {
        try {
            if(deleteSpinning) return; 
            setDeleteSpinning(true);
            if(notificationSocket){
                console.log("Emitting declineFriendRequest notification");
                notificationSocket.emit("declineFriendRequest", {
                    friendRequestId: requestId 
                }, () => {
                    console.log("Successfully emitted decline friend request.");
                });
            }
            setDeleteSpinning(false);
        } catch (err) {
            console.error(`Error while sending decline friend request notification to server | ${err.message}`);
            setDeleteSpinning(false);
        }
    }
    return (tagName === account.tagName) ? "" : (
        <Row className="friend-request-list-item p-2">
            <Col className="text-small text-center my-auto opaque">
                Friend request from @{tagName}
            </Col>
            <Col xs="5" className="text-center p-2 opaque">
            {
                (spinning) ? 
                    <Spinner variant="success" size="sm" animation="border"></Spinner>
                : 
                (  
                    <Button className="button-bg mb-1 rounded-pill friend-request-button clearish" onClick={() => acceptFriendRequest()}>
                        <Tooltip title="Accept">
                            <GroupAddOutlinedIcon></GroupAddOutlinedIcon>
                        </Tooltip>
                    </Button> 
                )
            }
            {
                (deleteSpinning) ? 
                    <Spinner variant="danger" size="sm" animation="border"></Spinner>
                : 
                (
                    <Button className="button-bg rounded-pill friend-request-button text-danger clearish" onClick={() => declineFriendRequest()}>
                        <Tooltip title="Decline">
                            <NotInterestedOutlinedIcon></NotInterestedOutlinedIcon>
                        </Tooltip>
                    </Button>
                )
            }         
            </Col> 
        </Row>
    )
}

FriendRequestListItem.propTypes = {
    requestId: PropTypes.string, 
    tagName: PropTypes.string
}