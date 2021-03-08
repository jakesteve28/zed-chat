import React, {useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectConversations } from '../../store/slices/conversationsSlice';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import '../../styles/listitems.css';
import '../../styles/topbar.css';
export function AcceptedInviteListItem({ sender }){
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
            <Col className="text-small text-center my-auto opaque">
                Chat with {`${tag}`.length > 10 ? `${tag}`.substring(0,7) + "..." : `${tag}`}
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
    sender: PropTypes.string
}