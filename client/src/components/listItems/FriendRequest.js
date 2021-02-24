import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import GroupAddOutlinedIcon from '@material-ui/icons/GroupAddOutlined';
import NotInterestedOutlinedIcon from '@material-ui/icons/NotInterestedOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import { selectAccount } from '../../store/slices/accountSettingsSlice';
import { notificationSocket } from '../socket/notificationSocket';
import './listitems.css';
import '../topbar/topbar.css';

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

FriendRequestListItem.propTypes = {
    requestId: PropTypes.string, 
    tagName: PropTypes.string
}