import React, { useEffect, useState, useRef } from 'react' 
import { Row, Col, InputGroup, FormControl, Button, Spinner } from 'react-bootstrap';
import { SendRounded } from '@material-ui/icons';
import {
    selectCurrentConversation
} from './conversationsSlice';
import {
    selectAccount
} from '../account/accountSettingsSlice';
import { useSelector } from 'react-redux'
import { chatSocket } from '../socket/chatSocket';
import useWindowSize from '../sidebar/windowSize';
import regex from '../regex';
let searchTimeout;

export default function CurrentConversationMessageBox(){

    const [message, setMessage] = useState("");
    const account = useSelector(selectAccount);
    const currentConversation = useSelector(selectCurrentConversation);
    const formRef = useRef(null);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const size = useWindowSize();
    const [error, setError] = useState(false);
    const [pending, setPending] = useState(false);
    const [errorMsgs, setErrorMsgs] = useState([]);
    const [sending, setSending] = useState("");
    const [spinning, setSpinning] = useState(false);
    const checkInput = () => {
        let passing = true;
        if(regex.messageBody.test(message) === false){
            setErrorMsgs(["Invalid message body. Must be 1-200 characters.", ...errorMsgs]);
            passing = false;
        }
        if(!passing) setError(true);
        return passing;
    }

    const sendMessage = async () => {
        if(!checkInput()){
            console.log("Error with sending message", errorMsgs);
            return;
        }
        console.log("Send message ", message);
        setPending(true);
        if(chatSocket){
           chatSocket.emit('chatToServer', { sender: account.tagName, room: currentConversation.id, body: `${message}` });
           setSpinning(true);
           formRef.current.value = ""
           setPending(false);
        }
        else {
            setError(true);
            setErrorMsgs(["Corrupted chat socket. Please refresh."])
            console.log("Corrupted chat socket. Please refresh.");
            setPending(false);
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
    }, [currentConversation.id])
    useEffect(() => {
        if(currentConversation.messages && Array.isArray(currentConversation.messages)){
            setSpinning(false);
        }
    }, [currentConversation.messages])
    return ( 
        <div>
            <Row className="w-100 text-center" style={{ position: "fixed", bottom: 40, left: 50 }}>
                {(size.width > 768) ? (<Col style={{ minWidth: "240px", maxWidth: "240px" }}></Col>) : "" }
                <Col className="mx-auto" style={{ paddingRight: "15px", paddingLeft: (size.width > 768) ? "2%" : "5%" }}>
                {(error) ? (<div className="text-danger lead" style={{ opacity: 0.7 }}>{errorMsgs}</div>) : ""}
                <InputGroup className="pb-3 mx-auto">
                    <FormControl
                        style={{ backgroundColor: "#404040", color: "white", border: "none" }}
                        placeholder="Enter a Message"
                        aria-label="Enter a Message"
                        aria-describedby="basic-addon2"
                        className="rounded-pill p-4"
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
                            (<Button onClick={async () => { 
                                await sendMessage() } } 
                                    className="ml-1 rounded-pill text-right" 
                                    variant="outline-secondary" 
                                    style={{ "border": "none", 
                                    backgroundColor: "#404040", 
                                    color: "#02a5ff" }} 
                                    id="basic-addon2">
                                <SendRounded 
                                    style={{ color: "white", opacity: "0.87"}}
                                >
                                </SendRounded>
                            </Button>)
                    }  
                    </InputGroup.Append>
                </InputGroup>
                </Col>
                <Col xs="1"></Col>
            </Row>
        </div>
    );
}