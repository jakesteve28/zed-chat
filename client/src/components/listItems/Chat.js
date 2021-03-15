import React, { useState } from 'react';
import { Row, Col, Dropdown, Container } from 'react-bootstrap';
import { ListItem, Tooltip } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PropTypes from 'prop-types'; 
import '../../styles/listitems.css';
import '../../styles/topbar.css';

export default function ChatListItem({  conversation, 
                                        selectConversation, 
                                        deleteConversation, 
                                        selected }) {
    const [showDropdown, setShowDropdown] = useState(false);                                   
    return (
        <ListItem onClick={() => selectConversation(conversation)} key={conversation.id} className={(selected) ? "sidebar-list-item selected-sidebar" : "sidebar-list-item"} >
            <Container fluid>
                <Row>
                    <Col>
                        <Container fluid>
                            <Row className="sidebar-list-item-conv-name">
                                {conversation.conversationName}
                            </Row>
                            <Row className="w-100 sidebar-list-item-conv-preview">
                                <div className="ml-1 d-block text-truncate">
                                    {(Array.isArray(conversation.messages) && conversation.messages[0]) ? conversation?.messages[0]?.body : ""}            
                                </div>
                            </Row>
                            <Row className="lead w-100 mt-1 sidebar-list-item-conv-date">
                                <div className="ml-1 d-block font-italic">
                                    {new Date(Date.parse(conversation.createdAt)).toLocaleString('en-US')}   
                                </div>
                            </Row>
                        </Container>
                    </Col>
                    <Col className={(selected) ? "hide-conv-info text-right" : "hide-conv-info text-right"}>
                        <Container fluid>
                            <Dropdown className={(selected) ? "dropdown-delete-conv" : "dropdown-delete-conv"} show={showDropdown}>   
                                <Dropdown.Toggle as="button" onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowDropdown(!showDropdown);
                                }}
                                className="text-white delete-chat-morevert">
                                    <Tooltip title="Chat Actions">
                                        <MoreVertIcon />
                                    </Tooltip>  
                                </Dropdown.Toggle>                   
                                <Dropdown.Menu className="delete-conv-dropdown-menu">        
                                    <Dropdown.Item  
                                        as="button" onMouseDown={ 
                                            (e) =>
                                            {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if(deleteConversation) deleteConversation(conversation.id);
                                            }} className="delete-conv-dropdown-button">
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