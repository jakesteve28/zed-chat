import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import '../../styles/topbar.css';
export default function MessageDropdown({ sentByMe, deleteMessage }){
    return (
    <Dropdown className={(sentByMe) ? "msg-dropdown message-dropdown-sender light-hover" : "msg-dropdown message-dropdown-received light-hover"}  drop={(sentByMe) ? "left" : "right"} >              
      <Dropdown.Toggle 
          as={Button} variant="dark" className="message-menu-button">
          <MoreVertIcon></MoreVertIcon>
      </Dropdown.Toggle>
      <Dropdown.Menu className="my-dropdown-message shadow text-white text-center">        
          {
              (sentByMe) ?  <Dropdown.Item  
                              className="text-white shadow dropdown-item-message" 
                              as="button" onClick={ 
                                  (e) =>
                                  {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if(deleteMessage) deleteMessage();
                                  }}>
                              Delete&nbsp;<DeleteOutlineIcon></DeleteOutlineIcon>
                          </Dropdown.Item> : ""
          }
      </Dropdown.Menu>
    </Dropdown>)
}
MessageDropdown.propTypes = {
    sentByMe: PropTypes.bool, 
    deleteMessage: PropTypes.func
}