import React, { useEffect, useState, useRef } from 'react' 
import { Row, Col, InputGroup, FormControl, Button } from 'react-bootstrap';
import { SendRounded } from '@material-ui/icons';
import io from 'socket.io-client'
import {
    selectCurrentConversation,
    addMessage,
    setTyping
} from './conversationsSlice';

import {
    selectAccount
} from '../account/accountSettingsSlice';

import {
    selectToken
} from '../auth/authSlice';

import { useDispatch, useSelector } from 'react-redux'

let _socket 
let searchTimeout

export default function CurrentConversationMessageBox(props){
    const [message, setMessage] = useState("")
    const account = useSelector(selectAccount)
    const currentConversation = useSelector(selectCurrentConversation)
    const token = useSelector(selectToken)
    const dispatch = useDispatch()
    const formRef = useRef(null)
    const [typingTimeout, setTypingTimeout] = useState(null)
    const sendMessage = async () => {
        if(_socket){
           _socket.emit('chatToServer', JSON.stringify({ sender: account.tagName, _socket: { id: _socket.id }, room: currentConversation.id, message: `${message}` }));
        }
            else {
                console.log("No Conversation to send message to")
            }
        }
    const sendTyping = (isTyping) => {
        if(_socket && account && currentConversation){
            _socket.emit('typing', JSON.stringify({ sender: account.tagName, _socket: { id: _socket.id }, room: currentConversation.id, typing: isTyping }));
        }
        else {
            console.log("No Conversation to send typing to")
        }
    }
    useEffect(() => {
        if(currentConversation && currentConversation.id && token && account){
            const socketOptions = {
                transportOptions: {
                    polling: {
                        extraHeaders: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                }
            }
            _socket = io('http://localhost:42020/zed-chat-rooms', socketOptions)
            if(_socket && currentConversation && currentConversation.id){
                _socket.emit('joinRoom', currentConversation.id);
                _socket.on('chatToClient', (msg) => {
                    if(msg.message.id && msg.message.body && msg.message.createdAt){
                        dispatch(addMessage({ message: msg.message, conversation: currentConversation }));
                    }
                });
                _socket.on('connect', () => {
                    console.log('connected');
                });
                _socket.on('joinedRoom', (room) => {
                    console.log('joined room: ' + JSON.stringify(room));
                });
                _socket.on('leftRoom', (room) => {
                    console.log('left room: ' + room);
                });
                _socket.on('delivered', (msg) => {
                    if(msg.message.id && msg.message.body && msg.message.createdAt){
                        console.log("Message delivered: ", msg)
                        dispatch(addMessage({ message: msg.message, conversation: msg.message.conversation }));
                    }
                })
                _socket.on('typing', (msg) => {
                    console.log(msg)
                    if(currentConversation.id === msg.conv){
                        if(msg.user && msg.typing === true){
                            if(msg.user.id !== account.id){     
                                    console.log('typing')
                                    dispatch(setTyping(true))
                                }
                            }
                        if(msg.user && msg.typing === false){
                            if(msg.user.id !== account.id){
                                dispatch(setTyping(false))
                            }
                        }  
                    }
                })
            if(_socket && formRef && currentConversation && account){
                formRef.current.onkeypress = () => { 
                    if (searchTimeout !== undefined) clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        console.log("typing done")
                        setTypingTimeout(false)
                        sendTyping(false)
                    }, 1000);
                }
            }
        } else {
                console.log("Socket error, cannot receive or send messages");
            }
            return () => {
                if(_socket){
                    if(currentConversation && currentConversation.id)
                        _socket.emit("leaveRoom", { room: currentConversation.id });
                    _socket.off('chatToClient')
                    _socket.off('connect')
                    _socket.off('joinedRoom')
                    _socket.off('leftRoom')
                    _socket.off('delivered')
                    _socket.off('readMessage')
                }     
            }
        } else {
            console.log("Socket not setup: no current conversation");
        }
    }, [currentConversation]);
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
                    onChange={async (e) => {
                        if(_socket && !typingTimeout){
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