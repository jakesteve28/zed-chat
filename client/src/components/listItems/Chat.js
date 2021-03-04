import React, { useState } from 'react';
import { Row, Col, Button, Dropdown, Container } from 'react-bootstrap';
import { ListItem, Tooltip } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PropTypes from 'prop-types'; 
import './listitems.css';
import '../topbar/topbar.css';

export default function ChatListItem({  conversation, 
                                        selectConversation, 
                                        deleteConversation, 
                                        selected }) {
    const [showDropdown, setShowDropdown] = useState(false);                                   
    return (
        <ListItem onClick={() => selectConversation(conversation)} key={conversation.id} className={(selected) ? "sidebar-list-item light-selected" : "sidebar-list-item light-hover"} >
            <Container fluid className={(selected) ? "darkish light-selected" : "darkish light-hover"} >
                <Row className={(selected) ? "darkish light-selected" : "darkish light-hover"}>
                    <Col className={(selected) ? "conv-info light-selected" : "conv-info light-hover"}>
                        <Container fluid className={(selected) ? "light-selected" : "light-hover"}>
                            <Row className="font-italic text-primary sidebar-list-item-conv-name">
                                {conversation.conversationName}
                            </Row>
                            <Row className="w-100 sidebar-list-item-conv-preview">
                                <div className="ml-1 d-block text-truncate">
                                    {conversation.messages[0].body}            
                                </div>
                            </Row>
                            <Row className="lead w-100 mt-1 sidebar-list-item-conv-date">
                                <div className="ml-1 d-block font-italic">
                                    {new Date(Date.parse(conversation.createdAt)).toLocaleString('en-US')}   
                                </div>
                            </Row>
                        </Container>
                    </Col>
                    <Col className={(selected) ? "darkish hide-conv-info text-right light-selected" : "darkish hide-conv-info text-right light-hover"}>
                        <Container className={(selected) ? "darkish light-selected" : "darkish light-hover"} fluid>
                            <Tooltip title="Chat Actions">
                                <Button onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowDropdown(!showDropdown);
                                    }}
                                    className="dropdown-toggle-conv-info text-white darkish delete-chat-morevert"
                                    variant="dark"
                                >
                                    <MoreVertIcon></MoreVertIcon>
                                </Button>
                            </Tooltip>  
                            <Dropdown className={(selected) ? "darkish light-selected dropdown-delete-conv" : "darkish light-hover dropdown-delete-conv"} show={showDropdown}>                      
                                <Dropdown.Menu className="my-dropdown shadow text-white text-center darkish">        
                                    <Dropdown.Item  
                                        className="text-white shadow conv-dropdown p-2" 
                                        as="button" onClick={ 
                                            (e) =>
                                            {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if(deleteConversation) deleteConversation(conversation.id);
                                            }}>
                                        Delete&nbsp;<DeleteOutlineIcon></DeleteOutlineIcon>
                                    </Dropdown.Item>                                                    
                                </Dropdown.Menu>
                            </Dropdown>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </ListItem>
    );
}

ChatListItem.propTypes = {
    conversation: PropTypes.object,
    selectConversation: PropTypes.func, 
    deleteConversation: PropTypes.func, 
    selected: PropTypes.bool
}