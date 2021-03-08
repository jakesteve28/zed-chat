import React, { useState, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import ChatBox from './ChatBox';
import MessagesListView from './MessagesListView';
import {
    selectView,
    selectCurrentConversation,
    batchAddMessages
  } from '../../store/slices/conversationsSlice';
import '../../styles/chat.css';
export default function ChatContainer(){
    const defaultView = useSelector(selectView);   
    const [isTyping, setIsTyping] = useState(false);
    const currentConversation = useSelector(selectCurrentConversation);
    const [lazyLoading, setLazyLoading] = useState(false);
    const dispatch = useDispatch(); 
    const lazyLoadMessages = async () => {
        setLazyLoading(true);
        try {
            console.log("Requesting more messages for conversation " + currentConversation.id)
            const messageResult = await fetch(`http://localhost:3000/api/conversation/messages/range/?` + new URLSearchParams({
                id: currentConversation.id,
                beforeDate: currentConversation.messages[0].createdAt,
                number: 25,
            }), {
                headers: {
                    'credentials': 'include'
                }
            });
            const messages = await messageResult.json(); 
            if(Array.isArray(messages)) {
                console.log("Successfully processed lazy-loaded messages");
                console.log(messages);
                dispatch(batchAddMessages({ messages: messages, conversationId: currentConversation.id }));     
                setLazyLoading(false);
            }
        } catch(err) {
            console.error("Error while attempting to lazy load messages. Try a login/logout or refresh");
            setLazyLoading(false);
        }
    }
    useEffect(() => {
        if(currentConversation && currentConversation.typing !== undefined){
            console.log("Typing");
            setIsTyping(currentConversation.typing)
        }
    }, [currentConversation.typing]);
    return (
        (defaultView) ?
        <Container fluid>
        </Container>
        :
        <Container fluid className="h-100">
            <Container className="h-100 w-100 chat-container" fluid>
                <Row className="chat-container-row-list">
                    <MessagesListView lazyLoadMessages={lazyLoadMessages} defaultView={defaultView}></MessagesListView>
                </Row>
            </Container>
            <div className="chat-container-row-form">
                <ChatBox isTyping={isTyping} isLazyLoading={lazyLoading}></ChatBox>
            </div>
        </Container>
    )
}