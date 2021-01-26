import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, InputGroup, FormControl, Button, Container } from 'react-bootstrap';
import { selectAccount } from '../account/accountSettingsSlice';
import { selectFriends } from '../account/friendsSlice';
import { selectConversations } from '../currentConversation/conversationsSlice';
import { useSelector } from 'react-redux';
import useWindowSize from '../sidebar/windowSize';
import './new-conversation.css';
import regex from '../regex.js';
import { SearchOutlined } from '@material-ui/icons';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core';
import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import Tooltip from '@material-ui/core/Tooltip';
import SendIcon from '@material-ui/icons/Send';
import { notificationSocket } from '../socket/notificationSocket';
import { Modal } from '@material-ui/core';
import PasswordModalBody from './SetPWModal';
import BackgroundModalBody from './SetBGModal';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
const FriendCheckbox = withStyles({
    root: {
        color: "#303030",
        '&$checked': {
            color: "#AAAAAA"
        },
    },
    checked: {},
})((props) => <Checkbox color="default" {...props} />);

function FriendListItemCheckBox({ id, tagName, onCheck }){
    const [checked, setChecked] = useState(false);
    const check = () => {
        setChecked(!checked);
    }
    useEffect(() => {
        onCheck(tagName, checked);
    }, [checked]);
    return (    
        <Row className="friend-new-chat text-white text-center mx-auto" 
            key={id} onClick={() => check()}>
            <Col xs="2" className="friend-list-item-checkbox">
                <FriendCheckbox
                    checked={checked}
                    inputProps={{ 'style': { backgroundColor: "white" } }}
                />
            </Col>
            <Col xs="10" className="friend-list-item-tagname">
                @{tagName}
            </Col>
        </Row>
    )
}

export default function NewConversation(){
    const friends = useSelector(selectFriends); 
    const conversations = useSelector(selectConversations);
    const account = useSelector(selectAccount);
    const [searchBar, _setSearchBar] = useState("");
    const [conversationName, setConversationName] = useState("");
    const size = useWindowSize();
    const [error, setError] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [sidebarAlign, setSidebarAlign] = useState(false);
    const [errorName, setErrorName] = useState(false);
    const [errorSearch, setErrorSearch] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(true);
    const newName = useRef(null);
    const errorMsgs = useRef([]);
    const searchBarInput = useRef(null);
    const [passwordOpened, setPasswordOpened] = useState(false);
    const [backgroundOpened, setBackgroundOpened] = useState(false);
    const [convPassword, setConvPassword] = useState("");
    const [backgroundImage, setBackgroundImage] = useState("");

    const filterList = () => {
        setErrorSearch(false);
        setError(false);
        errorMsgs.current = []
        if(regex.tagName.test(searchBar) === false){
            setErrorSearch(true);
            setError(true);
            _setSearchBar("");
            errorMsgs.current.push("Invalid tagname for search");
            return;
        }
        setFilteredFriends(filteredFriends.filter(friend => (friend.tagName.includes(searchBar) || searchBar.includes(friend.tagName))));
    }

    const handleCheck = (tagName, checked) => {
        const arr = JSON.parse(JSON.stringify(selectedFriends));
        if(checked){
            if(selectedFriends.length > 0){
                if(selectedFriends.filter(fr => fr === tagName).length > 1){
                    return;
                } else {
                    arr.push(tagName)
                    setSelectedFriends(arr);
                    return;
                }
            } else {
                setSelectedFriends([tagName]);
                return;
            }   
        } else {
            if(selectedFriends.length > 0){
                if(selectedFriends.filter(fr => fr === tagName).length > 0){
                    setSelectedFriends(selectedFriends.filter(fr => fr !== tagName));
                    return;
                 } else {
                     return;
                 }
            } else {
                setSelectedFriends([]);
            }
        }
    }
    const checkInput = () => {
        let passing = true;
        //First check if name is okay
        if(regex.conversationName.test(conversationName) === false){
            errorMsgs.current.push("Invalid Conversation Name");
            setErrorName(true);
            passing = false;
        }
        //Next check if name already exists
        if(conversations.filter(conv => conv.conversationName === conversationName).length === 1){
            errorMsgs.current.push("Conversation with that name already exists");
            setErrorName(true);
            passing = false;
        }
        //check each friend and if tag if it exists in friends list
        let isFriends = true;
        for(let friendTag of selectedFriends){
            //if friends list doesnt include a friend with the tagname
            if(friends.filter(fr => fr.tagName === friendTag).length === 0){
                errorMsgs.current.push(`Friend with tagname ${friend} isn't in your friends list`);
                passing = false;
                break;
            }
        }
        //check if users are already in a conversation with you
        //Deep compare the users array, filtering out self (JSON.stringify works, no functions are declared just data?)
        for(let conv of conversations) {
            const otherUsers = (conv.users.filter(user => user.id !== account.id)).map(user => { return user.tagName });
            if(otherUsers && otherUsers.length > 0 && JSON.stringify(otherUsers) === JSON.stringify(selectedFriends)){
                errorMsgs.current.push(`Chat named "${conv.conversationName}" with selected friends exists`);
                passing = false;
                break;
            } 
        }
        if(!passing) setError(true);
        return passing;
    }

    const handleSetConvPassword = (value) => {
        setConvPassword(value);
    }

    const handleSetBackgroundImage = (value) => {
        setBackgroundImage(value);
    }

    const submit = () => {
        errorMsgs.current = [];
        setError(false);
        setErrorName(false);
        setErrorSearch(false);
        if(!checkInput()){
            console.log("Errors: ", errorMsgs);
            return;
        } 
        console.log("Creating new conversation and sending invites to users from friends list. Users: ", selectedFriends);
        for(let user of selectedUsers){
            if(notificationSocket){
                notificationSocket.emit('sentInvite', { sender: account, tagName: user }, () => {
                    console.log("Successfully emitted send invite to user with tagname", user);
                });
            }
        }
    }
    useEffect(() => {
        if(newName && newName.current){
            newName.current.focus();
        }
    }, []);
    useEffect(() => {
        if(size.width > 768) {
            setSidebarAlign(true);
        } else {
            setSidebarAlign(false);
        }
    }, [size.width]);
    useEffect(() => {
        if(selectedFriends.length < 1){
            setButtonsDisabled(true);
            console.log("Buttons disabled")
        } else {
            setButtonsDisabled(false);
            console.log("Buttons enabled")
        }
    }, [selectedFriends]);
    useEffect(() => {
        setFilteredFriends(JSON.parse(JSON.stringify(friends)));
    }, [friends]);


    return (
        <div className={(sidebarAlign) ? "sidebar-padding new-conv-container" : "new-conv-container"}>
            <Row className="pb-4 mb-4"  style={{ borderBottom: "1px solid #303030" }}>
                <Col className="text-center" style={{ color: "#EEEEEE", opacity: 0.8 }}>
                    <QuestionAnswerIcon style={{ height: 40, width: 40}}></QuestionAnswerIcon>
                </Col>
            </Row>
            <Row className="mt-2 mb-2"  style={{ borderBottom: "1px solid #303030" }}>
                <Col className="text-center mx-auto friend-search-new-chat">
                    <InputGroup className="mt-2 mx-auto">
                        <FormControl
                            style={{ textAlign: "center", fontSize: "19pt", opaciyt: 0.8, color: "#d9534f", minHeight: '50px', border: 'none', backgroundColor: "#191919", }}
                            placeholder="Enter Chat Name"
                            aria-label="Enter Chat Name"
                            aria-describedby="basic-addon1"
                            onChange={ e => setConversationName(e.target.value) }
                            className={ (errorName) ? "mx-auto lead form-control-red" : "mx-auto lead form-control-custom"}
                            autoComplete="new-password"
                            name="setNameNewConv"
                            />
                    </InputGroup>
                </Col>
            </Row>
            <Row className="mb-1" style={{ borderBottom: "1px solid #303030" }}>
                <Col className="text-center mx-auto">
                    <InputGroup className="mb-3 mt-2 mx-auto">
                        <FormControl
                            style={{ textAlign: "center", fontSize: "18pt", color: "#EEEEEE", opacity: 0.8, minHeight: '50px', border: 'none', backgroundColor: "#191919" }}
                            placeholder="Search friend tagnames"
                            aria-label="Search friend tagnames"
                            aria-describedby="basic-addon1"
                            onChange={ e => _setSearchBar(e.target.value) }
                            className={ (errorSearch) ? "mx-auto lead form-control-red font-italic" : "mx-auto lead form-control-custom font-italic"}
                            value={searchBar}
                            autoComplete="new-password"
                            name="searchFriendsNewConv"
                            />
                    </InputGroup>
                </Col>
                <Col xs="2" className="text-left pr-3">
                    <Button onClick={() => { filterList() }} variant="dark" style={{ marginTop: "10px", display: "block", backgroundColor: "#191919", border: "none" }}><span className="text-primary text-lg-center"><SearchOutlined style={{ color: "#BBBBBB", height: 35, width: 35, cursor: "pointer"}}></SearchOutlined></span></Button>
                </Col>
            </Row>
            <Row>
                <Col className="pt-1">
                    <Container fluid style={{ maxHeight: "250px", overflowY: "scroll"}}>
                        {
                            (filteredFriends && filteredFriends.length > 0) ?
                            (
                                filteredFriends.map((friend) => {
                                    return (
                                        <FriendListItemCheckBox key={friend.id} id={friend.id} tagName={friend.tagName} onCheck={handleCheck}></FriendListItemCheckBox>
                                    );
                                }) 
                            )
                            : 
                            <Row className="mb-4">
                                <Col className="mx-auto text-center text-muted font-italic pt-5">
                                    No friends available! Add a friend!
                                </Col>
                            </Row>
                        }
                    </Container>
                </Col>
            </Row>
            <Row className="mt-5 pt-3 border-top border-dark">
                <Modal
                    open={passwordOpened}
                    onClose={() => setPasswordOpened(false)}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <PasswordModalBody handleSetConvPassword={handleSetConvPassword} ></PasswordModalBody>
                </Modal>
                <Col xs="4" className="p-2 mt-3">
                        <Button aria-label="Set Password" variant="dark" disabled={buttonsDisabled} style={{ backgroundColor: "#191919", border: "none", opacity: (buttonsDisabled) ? 0.5 : 1.0,

                        }} onClick={ () => setPasswordOpened(true) }>
                            <Tooltip title="Set Password">
                                    <EnhancedEncryptionIcon style={{ color: "#BBBBBB", width: 50, height: 50 }}></EnhancedEncryptionIcon>
                            </Tooltip>
                        </Button>
                </Col>
                <Col xs="4"></Col>
                <Col xs="4" className="mt-3 p-2">
                    <Button className="rounded-pill" disabled={buttonsDisabled} style={{ opacity: (buttonsDisabled) ? 0.5 : 1.0,  border: "none", backgroundColor: "#191919", minWidth: "100px" }} onClick={ () => submit() }>
                        <Tooltip title="Send Chat Invite(s)">
                            <SendIcon style={{ color: "#BBBBBB", width: 50, height: 50 }}></SendIcon>
                        </Tooltip>
                    </Button>
                </Col>
            </Row>
            <Row className="pt-2 mt-2">
                <Col>
                    <ul>
                        {(error) ?
                            errorMsgs.current.map(el => (<li key={el} className="text-danger text-small">{el}</li>)) : "" }
                    </ul>
                </Col>
            </Row>
        </div>)
}

//TODO put this into a better place. 
//i.e. there is a default color that the base picture (pic/default color settable per user) fades into 
//     Then it is set by the user(s) after they enter the conversation
// <Modal
// open={backgroundOpened}
// onClose={() => setBackgroundOpened(false)}
// aria-labelledby="simple-modal-title"
// aria-describedby="simple-modal-description"
// >
// <BackgroundModalBody handleSetBackgroundImage={handleSetBackgroundImage} ></BackgroundModalBody>
// </Modal>
// <Col xs="4" className="p-2 mt-3">
// <Button variant="dark"  disabled={buttonsDisabled} style={{ backgroundColor: "#191919", border: "none", opacity: (buttonsDisabled) ? 0.5 : 1.0,
    
// }} onClick={ () => setBackgroundOpened(true) }>
// <Tooltip title="Set Background">
//     <InsertPhotoIcon style={{ color: "#2499bf", width: 50, height: 50 }}></InsertPhotoIcon>
// </Tooltip>
// </Button>
// </Col>