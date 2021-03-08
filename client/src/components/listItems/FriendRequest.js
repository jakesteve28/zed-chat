import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
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
            <Col className="text-small text-center my-auto opaque">
                Friend request from @{tagName}
            </Col>
            <Col xs="5" className="text-center p-2 opaque">
                <Button className="button-bg mb-1 rounded-pill friend-request-button clearish" onClick={() => { acceptFriendRequest() }}>
                    <Tooltip title="Accept">
                        <GroupAddOutlinedIcon></GroupAddOutlinedIcon>
                    </Tooltip>
                </Button> 
                <Button className="button-bg rounded-pill friend-request-button text-danger clearish" onClick={() => alert("Decline friend request")}>
                    <Tooltip title="Decline">
                        <NotInterestedOutlinedIcon></NotInterestedOutlinedIcon>
                    </Tooltip>
                </Button>
            </Col> 
        </Row>
    )
}

FriendRequestListItem.propTypes = {
    requestId: PropTypes.string, 
    tagName: PropTypes.string
}