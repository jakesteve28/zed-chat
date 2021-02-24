import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import FlagIcon from '@material-ui/icons/Flag';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import '../topbar/topbar.css';
export default function MessageDropdown({ sentByMe, deleteMessage, pinMessage }){
    return (
    <Dropdown className={(sentByMe) ? "msg-dropdown message-dropdown-sender light-hover" : "msg-dropdown message-dropdown-received light-hover"}  drop={(sentByMe) ? "left" : "right"} >              
      <Dropdown.Toggle 
          as={Button} variant="dark" className="message-menu-button">
          <MoreVertIcon></MoreVertIcon>
      </Dropdown.Toggle>
      <Dropdown.Menu style={{ backgroundColor: "#222222", minWidth: "80px"} } className="my-dropdown-message shadow text-white text-center">        
          <Dropdown.Item  
              className="text-white shadow dropdown-item-message" 
              as="button" onClick={ 
                  (e) =>
                  {
                      e.preventDefault();
                      e.stopPropagation();
                      if(pinMessage) pinMessage();
                  }}>
              Pin&nbsp;<FlagIcon></FlagIcon>
          </Dropdown.Item>    
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
    deleteMessage: PropTypes.func,
    pinMessage: PropTypes.func
}