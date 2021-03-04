import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, InputGroup, FormControl, Button, Container } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { selectAccount } from '../../store/slices/accountSettingsSlice';
import { selectFriends } from '../../store/slices/friendsSlice';
import { selectConversations } from '../../store/slices/conversationsSlice';
import { useSelector, useDispatch } from 'react-redux';
import useWindowSize from '../../util/windowSize';
import regex from '../../util/regex.js';
import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption';
import SmsIcon from '@material-ui/icons/Sms';
import { notificationSocket } from '../socket/notificationSocket';
import { Modal } from '@material-ui/core';
import PasswordModalBody from '../modals/SetPWModal';
import { setTopbarMessage } from '../../store/slices/uiSlice';
import SelectFriendsListView from './SelectFriendsListView';
import { toast } from 'react-toastify'; 
import './startchat.css';

export function EnterChatName({ setConversationName, errorName }){
    const enterChatRef = useRef(null);
    useEffect(() => {
        if(enterChatRef.current){
            enterChatRef.current.focus();
        }
    }, [enterChatRef.current]);
    return (
        <Row>
            <Col>
                <Container fluid className="start-chat-enter-name">
                    <InputGroup className="mt-2 mx-auto">
                        <FormControl
                            placeholder="Enter Chat Name"
                            aria-label="Enter Chat Name"
                            aria-describedby="basic-addon1"
                            onChange={ e => setConversationName(e.target.value) }
                            className={ (errorName) ? "mx-auto lead form-control-red placeholder-mod enter-chat-form" : "mx-auto lead form-control-custom placeholder-mod enter-chat-form"}
                            autoComplete="new-password"
                            name="setNameNewConv"
                            ref={enterChatRef}
                            />
                    </InputGroup>
                </Container>
            </Col>
        </Row>
    )
}

export default function StartChat(){
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
    const dispatch = useDispatch();
    const friends = useSelector(selectFriends);
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
            for(let friendTag of selectedFriends){
                //if friends list doesnt include a friend with the tagname
                if(!friends.some(fr => fr.tagName === friendTag)){
                    errorMsgs.current.push(`Friend with tagname ${friendTag} isn't in your friends list`);
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
        convPassword.split("").join("");
        setConvPassword(value);
    }
    // const handleSetBackgroundImage = (value) => {
    //     setBackgroundImage(value);
    // }
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
                notificationSocket.emit('sendInvite', { sender: account, tagName: user, conversationName: conversationName }, () => {
                    console.log("Successfully emitted send invite to user with tagname", user);
                });
            }
        }
        toast.info(`Successfully sent out conversation invites!`,  { position: "top-center", hideProgressBar: true, pauseOnHover: true});
    }
    useEffect(() => {
        if(newName && newName.current){
            newName.current.focus();
        }
    }, []);

    useEffect(() => {
        if(size.width > 768) {
            dispatch(setTopbarMessage(`Start a Chat`));
        } else {
            dispatch(setTopbarMessage(`Start a Chat`));
        }
    }, [size.width]);

    const modal = (
        <PasswordModalBody handleSetConvPassword={setConvPassword} className="FancyButton">
        </PasswordModalBody>
    );


    return (
        <Container className="h-100 w-100 start-chat-super-container" fluid>
            <Row>
                <Col className="start-column">
                    <Container fluid className="start-chat-container">       
                        <Row className="mt-2 mb-2 pb-2 start-chat-selection">
                            <Col>
                                <EnterChatName 
                                    setConversationName={setConversationName} 
                                    errorName={errorName}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-2 mb-2 pb-2 start-chat-selection">
                            <Col>
                                <SelectFriendsListView 
                                    errorSearch={errorSearch} 
                                    selectedFriends={selectedFriends}
                                    setSelectedFriends={setSelectedFriends}
                                    setErrorSearch={setErrorSearch}
                                    setError={setError}
                                    errorMsgs={errorMsgs}
                                    setButtonsDisabled={setButtonsDisabled}
                                />
                            </Col>
                        </Row>
                        <Row className="edit-chat-row">
                            <Modal
                                open={passwordOpened}
                                onClose={() => setPasswordOpened(false)}
                                aria-labelledby="simple-modal-title"
                                aria-describedby="simple-modal-description"
                            >
                            {modal}
                            </Modal>
                            <Col xs="6" className="mx-auto">
                                <Button 
                                    onClick={ () => setPasswordOpened(true) } 
                                    disabled={buttonsDisabled} 
                                    className="set-pw-button" 
                                    variant="outline-secondary" 
                                    size="lg"
                                    >
                                    Set&nbsp;Password&nbsp;<EnhancedEncryptionIcon className="chat-edit-icon"></EnhancedEncryptionIcon>
                                </Button>
                            </Col>
                            <Col xs="6" className="mx-auto">
                                <Button 
                                    onClick={ () => submit()} 
                                    disabled={buttonsDisabled} 
                                    className="send-invites-button" 
                                    variant="outline-success" 
                                    size="lg"
                                    >
                                    Invite&nbsp;<SmsIcon className="chat-edit-icon"></SmsIcon>
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

EnterChatName.propTypes = {
    setConversationName: PropTypes.func,
    errorName: PropTypes.bool
}
