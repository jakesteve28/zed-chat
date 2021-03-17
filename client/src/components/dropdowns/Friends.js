import React, { useState, useRef } from 'react';
import { Button, Container, Row, Dropdown, Col, FormControl, InputGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { SearchOutlined } from '@material-ui/icons';
import FriendListItem from '../listItems/Friend.js';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import GroupIcon from '@material-ui/icons/Group';
import Tooltip from '@material-ui/core/Tooltip';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import {
  selectAccount
} from '../../store/slices/accountSettingsSlice';
import {
  selectCurrentConversation,
  selectConversations
} from '../../store/slices/conversationsSlice';
import {
  selectFriends
} from '../../store/slices/friendsSlice';
import regex from '../../util/regex'
import { notificationSocket } from '../socket/notificationSocket';
import '../../styles/topbar.css';
import '../../styles/dropdowns.css';
export default function FriendsDropdown(){
    const dispatch = useDispatch();
    const history = useHistory();
    const account = useSelector(selectAccount);
    const friends = useSelector(selectFriends);
    const conversations = useSelector(selectConversations);
    const [addFriendInput, setAddFriendInput] = useState("");
    const [searchFriendInput, setSearchFriendInput] = useState("");
    const [error, setError] = useState(false);
    const [filteredFriends, setFilteredFriends] = useState(null);
    const [searchError, setSearchError] = useState(false);
    const [addError, setAddError] = useState(false);
    const errorMsgs = useRef([]);
    const currentConversation = useSelector(selectCurrentConversation);
    const checkInput = () => {
      let passing = true;
      errorMsgs.current = []
      if(regex.tagNameSearch.test(searchFriendInput) === false){
        passing = false;
        errorMsgs.current.push("Invalid friend name");
      }
      if(account.tagName === searchFriendInput){
        passing = false;
        errorMsgs.current.push("Cannot search/send self");
      }
      if(!passing) setError(true);
      return passing;
    }

    const checkAddFriendInput = () => {
      let passing = true;
      errorMsgs.current = []
      if(regex.tagName.test(addFriendInput) === false){
        passing = false;
        errorMsgs.current.push("Invalid tagname. Try 8-24 letters, numbers, dashes, underscores");
      }
      if(friends.filter(friend => friend.tagName === addFriendInput).length > 0) {
        passing = false;
        errorMsgs.current.push("Friend already exists");
      }
      if(account.tagName === addFriendInput) {
        passing = false; 
        errorMsgs.current.push("Cannot add self");
      }
      if(!passing) setError(true);
      return passing;
    }

    const searchFriends = () => {
      setError(false);
      if(!errorMsgs.current || Array.isArray(errorMsgs.current) === false || errorMsgs.current.length !== 0){
        errorMsgs.current = []
      }
      setSearchError(false);
      if(checkInput() === false){
        console.log("Error searching friend's list, invalid tag name!");
        setSearchError(true);
        return;
      }
      console.log(`Filtering friend's list by tagname | ${addFriendInput}`);
      if(friends.length > 1){
        setFilteredFriends(friends.filter(friend => friend.tagName.includes(searchFriendInput) ||
                                          searchFriendInput.includes(friend.tagName))); 
      }
    }

    const sendFriendRequest = async () => {
      setError(false);
      if(!errorMsgs.current || Array.isArray(errorMsgs.current) === false || errorMsgs.current.length !== 0){
        errorMsgs.current = []
      }
      setAddError(false);
      if(checkAddFriendInput() === false){
        console.log("Error cannot send friend request", errorMsgs);
        setAddError(true)
        return;
      }
      if(account && notificationSocket){
          notificationSocket.emit('sendFriendRequest', {
            senderId: account.id,
            recipientId: addFriendInput
          }, () => {
            console.log(`Friend request sent to user @${addFriendInput}`);
          });
        } else {
          console.log("Error sending friend request, not connected to notifications socket");
      }
    }

  return (
    <Dropdown className="ml-3 p-1 dark-background" >
      <Tooltip title="Friends List">
        <Dropdown.Toggle as="button" className="topbar-dropdown-icon dark-background top-dropdown-button font-weight-bold rounded-pill ml-2">
            <PeopleAltIcon></PeopleAltIcon>
        </Dropdown.Toggle>
      </Tooltip>
      <Dropdown.Menu className="topbar-dropdown-menu dark-background dropdown-menu-custom-bg dropdown-shadow">
      <Dropdown.ItemText className="text-center font-weight-bold lead mb-1 dark-background friends-title-menu" ><GroupIcon></GroupIcon>&nbsp;&nbsp;Friends</Dropdown.ItemText>
        <Container fluid className="h-100 pt-2 w-100">
          <Row className="m-1">
            <Col xs="10">
                <InputGroup>
                  <FormControl
                    placeholder="Add Friend By Tagname"
                    aria-label="Add Friend By Tagname"
                    aria-describedby="basic-addon1"
                    className={(addError) ? "search-friend-bar error-placeholder" : "search-friend-bar"}
                    onChange={(e) => { setAddFriendInput(e.target.value) }}
                  />
              </InputGroup>
            </Col>
            <Col xs="2">
              <Button variant="dark" className="mr-3 pr-2 send-friend-request-button dark-background" onClick={() => sendFriendRequest() } disabled={(addFriendInput.length < 8)}><PersonAddIcon className={(addError) ? "error-icon friend-icon" : "friend-icon"}></PersonAddIcon></Button>
            </Col>
          </Row> 
          <Row className="m-1 mt-2 mb-2 mb-1 pb-3">
              <Col xs="10">
                  <InputGroup>
                    <FormControl
                      placeholder="Search Friends..."
                      aria-label="Search Friends..."
                      aria-describedby="basic-addon1"
                      className={(searchError) ? "search-friend-bar error-placeholder" : "search-friend-bar"}
                      onChange={(e) => { setSearchFriendInput(e.target.value) }}
                    />
                </InputGroup>
              </Col>
              <Col xs="2">
                <Button variant="dark" className="send-friend-request-button" onClick={() => searchFriends() }><SearchOutlined className={(searchError) ? "error-icon friend-icon" : "friend-icon"}></SearchOutlined></Button>
              </Col>
            </Row> 
            <Row className="friends-list-row mt-1 pb-1">
              <Col className="friends-list-column">
              {
                (Array.isArray(filteredFriends)) ?
                    filteredFriends.map((el) => {
                      const convsWithFriend = []
                      if(conversations && Array.isArray(conversations)) {
                        for(let conv of conversations) {
                            if(conv.users && Array.isArray(conv.users)) {
                              for(let user of conv.users) {
                                  if(user.tagName === el.tagName) {
                                      convsWithFriend.push(conv);
                                      break;
                                  }
                              }
                            }
                        }
                      }
                      if(el && el.tagName){
                        return (
                          <Row key={el.tagName} className="friend-topbar friend-list-item-row">
                            <FriendListItem 
                              account={account} 
                              currentConversation={currentConversation} 
                              history={history} 
                              dispatch={dispatch} 
                              conversations={convsWithFriend} 
                              key={el.tagName} 
                              tagName={el.tagName} 
                              isOnline={el.isOnline}>
                            </FriendListItem>
                          </Row>
                        )
                      } else return null;                          
                    })
                :
                  friends.map((el) => {
                    if(el && el.tagName){
                      const convsWithFriend = []
                      if(conversations && Array.isArray(conversations)) {
                          for(let conv of conversations) {
                            if(conv.users && Array.isArray(conv.users)) {
                              for(let user of conv.users) {
                                  if(user.tagName === el.tagName) {
                                      convsWithFriend.push(conv);
                                      break;
                                  }
                              }
                            }
                          }
                      }
                      return (
                          <Row key={el.tagName} className="friend-topbar friend-list-item-row">
                            <FriendListItem 
                              account={account} 
                              currentConversation={currentConversation} 
                              history={history} 
                              dispatch={dispatch} 
                              conversations={convsWithFriend} 
                              key={el.tagName} 
                              tagName={el.tagName} 
                              isOnline={el.isOnline}>
                            </FriendListItem>
                          </Row>
                      )
                    } else return null;                          
                  })
                }
              </Col>
            </Row>  
        </Container>
        { (error) ? (
        <Container fluid className="text-left lead clearish">
          <Row className="font-italic text-danger errors-label-row">
              <span>Errors:</span>
          </Row>  
        <Row>
          <ul>
            {errorMsgs.current.map(el => (<li className="text-danger text-small" key={el}>{el}</li>))}
          </ul>
        </Row>
        </Container>
        ) : "" }
      </Dropdown.Menu>
    </Dropdown>
  );
}