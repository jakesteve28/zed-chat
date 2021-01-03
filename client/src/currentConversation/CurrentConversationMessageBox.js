import React, { useEffect, useState, useRef } from 'react' 
import { Row, Col, InputGroup, FormControl, Button } from 'react-bootstrap';
import { SendRounded } from '@material-ui/icons';
import {
    selectCurrentConversation
} from './conversationsSlice';

import {
    selectAccount
} from '../account/accountSettingsSlice';

import { useSelector } from 'react-redux'

import { chatSocket } from '../socket/chatSocket';

let searchTimeout

export default function CurrentConversationMessageBox(props){
    const [message, setMessage] = useState("")
    const account = useSelector(selectAccount)
    const currentConversation = useSelector(selectCurrentConversation)
    const formRef = useRef(null)
    const [typingTimeout, setTypingTimeout] = useState(null)

    const sendMessage = async () => {
        console.log("Send message ", message)
        if(chatSocket){
           chatSocket.emit('chatToServer', JSON.stringify({ sender: account.tagName, room: currentConversation.id, message: `${message}` }));
           formRef.current.value = ""
        }
        else {
            console.log("No Conversation to send message to")
        }
    }
    const sendTyping = (isTyping) => {
        if(chatSocket && account && currentConversation){
            chatSocket.emit('typing', JSON.stringify({ sender: account.tagName, chatSocket: { id: chatSocket.id }, room: currentConversation.id, typing: isTyping }));
        }
        else {
            console.log("No Conversation to send typing to")
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

    return ( 
        <Row className="w-100 text-center" style={{ position: "fixed", bottom: 0, left: 50 }}>
            <Col md="3"></Col>
            <Col sm="8 ml-1">
            <InputGroup className="pb-3">
                <FormControl
                    style={{ backgroundColor: "#404040", color: "white", "border": "none" }}
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
                            console.log("typing start")
                        }
                        setMessage(e.target.value)
                    }}
                />
                <InputGroup.Append>
                    <Button onClick={async () => { 
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
                        </SendRounded></Button>
                </InputGroup.Append>
            </InputGroup>
            </Col>
            <Col xs="1"></Col>
        </Row>
    );
}