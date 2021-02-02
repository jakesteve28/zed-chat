import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, InputGroup, FormControl, Button, Container } from 'react-bootstrap';
import { selectAccount } from '../account/accountSettingsSlice';
import { selectFriends } from '../account/friendsSlice';
import { selectConversations } from '../currentConversation/conversationsSlice';
import { useSelector, useDispatch } from 'react-redux';
import useWindowSize from '../sidebar/windowSize';
import './new-conversation.css';
import regex from '../regex.js';
import { SearchOutlined } from '@material-ui/icons';
import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption';
import SendIcon from '@material-ui/icons/Send';
import { notificationSocket } from '../socket/notificationSocket';
import { Modal } from '@material-ui/core';
import PasswordModalBody from './SetPWModal';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import { setTopbarMessage } from '../uiSlice';

function EnterChatName({ setConversationName, errorName }){
    const enterChatRef = useRef(null);
    useEffect(() => {
        if(enterChatRef.current){
            enterChatRef.current.focus();
        }
    }, [enterChatRef.current]);
    return (
        <Container fluid style={{ maxWidth: "500px" }}>
            <InputGroup className="mt-2 mx-auto">
                <FormControl
                    style={{ textAlign: "center", fontSize: "22pt", color: "#d9534f", minHeight: '50px', border: 'none', backgroundColor: "#191919" }}
                    placeholder="Enter Chat Name"
                    aria-label="Enter Chat Name"
                    aria-describedby="basic-addon1"
                    onChange={ e => setConversationName(e.target.value) }
                    className={ (errorName) ? "mx-auto lead form-control-red" : "mx-auto lead form-control-custom"}
                    autoComplete="new-password"
                    name="setNameNewConv"
                    ref={enterChatRef}
                    />
            </InputGroup>
        </Container>
    )
}
function AddFriends({ 
        errorSearch, 
        selectedFriends, 
        setSelectedFriends, 
        setErrorSearch, 
        setError, 
        errorMsgs,
        setButtonsDisabled
    }){

    const friends = useSelector(selectFriends); 
    const [searchBar, setSearchBar] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);

    useEffect(() => {
        setFilteredFriends(JSON.parse(JSON.stringify(friends)));
    }, [friends]);

    useEffect(() => {
        if(selectedFriends.length < 1){
            setButtonsDisabled(true);
            console.log("Buttons disabled")
        } else {
            setButtonsDisabled(false);
            console.log("Buttons enabled")
        }
    }, [selectedFriends]);

    const filterList = () => {
        setErrorSearch(false);
        setError(false);
        errorMsgs.current = []
        if(regex.tagName.test(searchBar) === false){
            setErrorSearch(true);
            setError(true);
            setSearchBar("");
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
    return (
        <Container fluid>
            <Row className="pb-3">
                <Col xs="2"></Col>
                <Col xs="8" className="border-bottom border-dark" style={{ maxWidth: "450px" }}>
                    <InputGroup className="mb-3 mt-2 mx-auto">
                        <FormControl
                            style={{ textAlign: "center", fontSize: "18pt", color: "#EEEEEE", opacity: 0.8, minHeight: '50px', border: 'none', backgroundColor: "#191919" }}
                            placeholder="Search friends"
                            aria-label="Search friends"
                            aria-describedby="basic-addon1"
                            onChange={ e => setSearchBar(e.target.value) }
                            className={ (errorSearch) ? "mx-auto lead form-control-red font-italic" : "mx-auto lead form-control-custom font-italic"}
                            value={searchBar}
                            autoComplete="new-password"
                            />
                        </InputGroup>
                </Col>
                <Col xs="2" style={{ maxWidth: "50px" }}>
                    <Button onClick={() => { filterList() }} variant="dark" style={{ marginTop: "10px", display: "block", backgroundColor: "#191919", border: "none" }}><span className="text-primary text-lg-center"><SearchOutlined style={{ color: "#BBBBBB", height: 35, width: 35, cursor: "pointer"}}></SearchOutlined></span></Button>
                </Col>
            </Row>
            <Row className="mb-2">
                <Col className="mx-auto">
                    <span className="font-italic text-small" style={{ color: "dodgerblue"}}>Select Friends For Chat</span>
                </Col>
             </Row>
            <Row>
                <Col xs="2"></Col>
                <Col xs="8" style={{ maxWidth: "500px" }}>
                    <Container fluid style={{ minHeight: "225px", overflowY: "scroll", backgroundColor: "#191919"}}>
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
                <Col xs="2"></Col>
            </Row>
        </Container>
    )
}

function FriendListItemCheckBox({ id, tagName, onCheck }){
    const [checked, setChecked] = useState(false);
    const check = () => {
        setChecked(!checked);
    }
    useEffect(() => {
        onCheck(tagName, checked);
    }, [checked]);
    const buttonBGClass = "p-3 m-2 account-button";
    return (
        <Row className="p-2">
            <Col className="text-center justify-content-around">
                <Button onClick={() => check()} className={(checked) ? "p-3 m-2 account-button-checked" : "p-3 m-2 account-button"} variant="dark" style={{ border: "none", backgroundColor: "#202020", padding: "15px", minWidth: "150px", maxWidth: "150px", minHeight: "125px", maxHeight: "125px" }} >@{tagName}</Button>
            </Col> 
        </Row>    
    )
}

export default function NewConversation(){
    const conversations = useSelector(selectConversations);
    const account = useSelector(selectAccount);
    const [conversationName, setConversationName] = useState("");
    const size = useWindowSize();
    const [error, setError] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [errorName, setErrorName] = useState(false);
    const [errorSearch, setErrorSearch] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(true);
    const newName = useRef(null);
    const errorMsgs = useRef([]);
    const [passwordOpened, setPasswordOpened] = useState(false);
    const [convPassword, setConvPassword] = useState("");
    const [backgroundImage, setBackgroundImage] = useState("");
    const dispatch = useDispatch();
    const friends = useSelector(selectFriends);
    const wide = size.width > 768;
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
        if(passing === true){
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
        for(let user of selectedFriends){
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
            dispatch(setTopbarMessage((<span><QuestionAnswerIcon></QuestionAnswerIcon>&nbsp;New Conversation</span>)));
        } else {
            dispatch(setTopbarMessage((<span><QuestionAnswerIcon></QuestionAnswerIcon></span>)));
        }
    }, [size.width]);

    return (
        <Container className="h-100 w-100" fluid  style={{ margin: "auto", paddingLeft: (wide) ?  "240px" : "20px" }}>
            <Row>
                <Col className="mx-auto text-center" style={{ opacity: 0.8, borderRadius: "10px", backgroundColor: "#191919", maxWidth: "600px" }}>
                    <Container fluid>       
                        <Row className="mt-2 mb-2">
                        <EnterChatName 
                            setConversationName={setConversationName} 
                            errorName={errorName}
                        />
                        </Row>
                        <Row className="mt-2 mb-2 pb-2">
                            <AddFriends 
                                errorSearch={errorSearch} 
                                selectedFriends={selectedFriends}
                                setSelectedFriends={setSelectedFriends}
                                setErrorSearch={setErrorSearch}
                                setError={setError}
                                errorMsgs={errorMsgs}
                                setButtonsDisabled={setButtonsDisabled}
                            />
                        </Row>
                        <Row className="pt-3">
                            <Modal
                                open={passwordOpened}
                                onClose={() => setPasswordOpened(false)}
                                aria-labelledby="simple-modal-title"
                                aria-describedby="simple-modal-description"
                            >
                                <PasswordModalBody handleSetConvPassword={handleSetConvPassword} ></PasswordModalBody>
                            </Modal>
                            <Col className="mx-auto">
                                <Button 
                                    onClick={ () => setPasswordOpened(true) } 
                                    disabled={buttonsDisabled} 
                                    className="rounded-pill p-2 mx-auto" 
                                    variant="outline-info" 
                                    size="lg"
                                    style={{ opacity: (buttonsDisabled) ? 0.5 : 1.0, maxWidth: '200px', marginTop: "20px" }}
                                    >
                                    Set&nbsp;Password&nbsp;<EnhancedEncryptionIcon style={{ width: 25, height: 25 }}></EnhancedEncryptionIcon>
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="mx-auto">
                                <Button 
                                    onClick={ () => submit()} 
                                    disabled={buttonsDisabled} 
                                    className="rounded-pill p-2 mx-auto" 
                                    variant="outline-success" 
                                    size="lg"
                                    style={{ opacity: (buttonsDisabled) ? 0.5 : 1.0, maxWidth: '200px', marginTop: "20px" }}
                                    >
                                    Sent Chat Invites <SendIcon style={{ width: 25, height: 25 }}></SendIcon>
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
                    </Container>
                </Col>
            </Row>
        </Container>)
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