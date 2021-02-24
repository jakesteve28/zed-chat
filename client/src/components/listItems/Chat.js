import React from 'react';
import { Row, Col, Button, Dropdown, Container } from 'react-bootstrap';
import { ListItem } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PropTypes from 'prop-types'; 
import './listitems.css';
import '../topbar/topbar.css';

export default function ChatListItem({  conversation, 
                                        selectConversation, 
                                        deleteConversation, 
                                        selected, 
                                        minWidth, 
                                        buttonMargin }) {
    return (
        <ListItem onClick={() => selectConversation(conversation)} key={conversation.id} className={(selected) ? "sidebar-list-item light-selected" : "sidebar-list-item light-hover"} style={{ backgroundColor: "#222222" }} >
            <Container fluid style={{ backgroundColor: "#222222" }} className={(selected) ? "light-selected" : "light-hover"} >
                <Row style={{ backgroundColor: "#222222" }} className={(selected) ? "light-selected" : "light-hover"}>
                    <Col className={(selected) ? "conv-info light-selected" : "conv-info light-hover"} style={{ minWidth: minWidth }}>
                        <Container fluid className={(selected) ? "light-selected" : "light-hover"}>
                            <Row className="font-italic text-primary" style={{ fontSize: "11pt", minWidth: minWidth  }}>
                                {conversation.conversationName}
                            </Row>
                            <Row className="w-100" style={{ fontSize: "9pt" }}>
                                <div className="ml-1 d-block text-truncate">
                                    {conversation.messages[0].body}            
                                </div>
                            </Row>
                            <Row className="lead w-100 mt-1" style={{ fontSize: "8pt"}}>
                                <div className="ml-1 d-block font-italic">
                                    {new Date(Date.parse(conversation.createdAt)).toLocaleString('en-US')}   
                                </div>
                            </Row>
                        </Container>
                    </Col>
                    <Col className={(selected) ? "hide-conv-info text-right light-selected" : "hide-conv-info text-right light-hover"}
                    style={{ backgroundColor: "#222222", marginLeft: buttonMargin }}>
                        <Container className={(selected) ? "light-selected" : "light-hover"} style={{ backgroundColor: "#222222" }} fluid>
                            <Dropdown className={(selected) ? "light-selected" : "light-hover"} style={{ backgroundColor: "#222222", marginLeft: "-20px"}}>              
                                <Dropdown.Toggle 
                                    className="dropdown-toggle-conv-info text-white"
                                    style={{ border:" none", backgroundColor: "#222222"}} 
                                    as={Button} variant="dark" id="dropdown-custom-components">
                                    <MoreVertIcon></MoreVertIcon>
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{ backgroundColor: "#222222"}} className="my-dropdown shadow text-white text-center">        
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
    conversation: {
        id: PropTypes.string, 
        conversationName: PropTypes.string, 
        messages: PropTypes.arrayOf({ body: PropTypes.string }),
        createdAt: PropTypes.string 
    }, 
    selectConversation: PropTypes.func, 
    deleteConversation: PropTypes.func, 
    selected: PropTypes.bool, 
    minWidth: PropTypes.number,
    buttonMargin: PropTypes.number
}