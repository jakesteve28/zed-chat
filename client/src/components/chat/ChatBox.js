import React, { useEffect, useState, useRef } from 'react' 
import { Row, Col, InputGroup, FormControl, Button, Spinner, Container } from 'react-bootstrap';
import { SendRounded } from '@material-ui/icons';
import {
    selectCurrentConversation
} from '../../store/slices/conversationsSlice';
import {
    selectAccount
} from '../../store/slices/accountSettingsSlice';
import { useSelector } from 'react-redux'
import { chatSocket } from '../socket/chatSocket';
import regex from '../../util/regex';
import PropTypes from 'prop-types';
import './chat.css';
let searchTimeout;

export default function ChatBox({ isTyping, isLazyLoading }){
    const [message, setMessage] = useState("");
    const account = useSelector(selectAccount);
    const currentConversation = useSelector(selectCurrentConversation);
    const formRef = useRef(null);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [error, setError] = useState(false);
    const [errorMsgs, setErrorMsgs] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const checkInput = () => {
        let passing = true;
        if(regex.messageBody.test(message) === false){
            setErrorMsgs(["Invalid message body. Must be 1-200 characters."]);
            passing = false;
        }
        if(!passing) setError(true);
        return passing;
    }

    const sendMessage = async () => {
        setError(false);
        setErrorMsgs([]);
        if(!checkInput()){
            console.log("Error with sending message", errorMsgs);
            return;
        }
        console.log("Send message ", message);
        if(chatSocket){
           chatSocket.emit('chatToServer', { sender: account.tagName, room: currentConversation.id, body: `${message}` });
           setSpinning(true);
           formRef.current.value = ""
        }
        else {
            setError(true);
            setErrorMsgs(["Corrupted chat socket. Please refresh."])
            console.log("Corrupted chat socket. Please refresh.");
        }
    }
    const sendTyping = (isTyping) => {
        if(chatSocket && account && currentConversation){
            chatSocket.emit('typing', { sender: account.tagName, room: currentConversation.id, typing: isTyping } );
        }
        else {
            console.log("Error: no conversation to send typing to! Please refresh")
        }
    }
    useEffect(() => {
        if(currentConversation.messages && Array.isArray(currentConversation.messages)){
            setSpinning(false);
        }
    }, [currentConversation.messages]);
    useEffect(() => {
        if(chatSocket && formRef && currentConversation && account){
            formRef.current.onkeypress = () => { 
                if (searchTimeout !== undefined) clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    console.log("typing done")
                    setTypingTimeout(false)
                    sendTyping(false)
                }, 1000);
            }
        }
    }, [currentConversation.id]);
    return ( 
        <Container fluid className="w-100 h-100">
            <Row className="w-100 text-center fixed-chat-box">
                <Col className="mx-auto fixed-chat-box-column">
                {(error) ? (<div className="text-danger lead opaque">{errorMsgs}</div>) : ""}
                <InputGroup className="pb-3 mx-auto">
                    <FormControl
                        placeholder="Enter a message"
                        aria-label="Enter a message"
                        aria-describedby="basic-addon2"
                        className="rounded-pill p-4 chat-box-form"
                        ref={formRef}
                        onKeyPress={
                            async (e) => {
                                if(e.key === "Enter") {
                                    await sendMessage()
                                }
                            }
                        }
                        onChange={async (e) => {
                            if(chatSocket && !typingTimeout){
                                setTypingTimeout(true)
                                sendTyping(true)
                                console.log("Typing started")
                            }
                            setMessage(e.target.value)
                        }}
                    />
                    <InputGroup.Append>
                    {
                        (spinning) ? <Spinner className="m-2 p-2" size="lg" variant="info" animation="border" /> :
                            (<Button onClick={async () => { await sendMessage() } } 
                                    className="ml-1 rounded-pill text-right send-message-button" 
                                    id="basic-addon2"
                                    variant="dark">
                                <SendRounded 
                                    className="send-message-icon" 
                                >
                                </SendRounded>
                            </Button>)
                    }  
                    </InputGroup.Append>
                    <InputGroup.Append>
                    {
                        (isLazyLoading) ? <Spinner className="m-2 p-2" size="lg" variant="info" animation="border" /> : ""
                    }
                    {
                        (isTyping) ? <span><Spinner className="m-2 p-2" size="sm" variant="info" animation="grow" /></span> : ""
                    }
                    </InputGroup.Append>
                </InputGroup>
                </Col>
                <Col xs="1"></Col>
            </Row>
        </Container>
    );
}

ChatBox.propTypes = {
    isTyping: PropTypes.bool,
    isLazyLoading: PropTypes.bool
}