import React, { useEffect, useState, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { 
    selectCurrentConversation,
    sortMessages
} from '../../store/slices/conversationsSlice';
import MessageListItem from '../listItems/Message'; 
import './messages.css';
import '../sidebar/sidebar.css'; 

export default function MessagesListView({ defaultView, lazyLoadMessages }){
    const [messages, setMessages] = useState([]);
    const [lazyLoading, setLazyLoading] = useState(false);
    let currentConversation = useSelector(selectCurrentConversation);
    const colRef = useRef();
    const dispatch = useDispatch();
    const handleScroll = async () => {
        if(colRef.current){
            if(colRef.current?.scrollTop <= 100 && !lazyLoading) {
                setLazyLoading(true);
                if(currentConversation?.messages?.length < currentConversation?.numberOfMessages){
                    await lazyLoadMessages();
                    setLazyLoading(false);
                }
            }
        }
    }
    useEffect(() => {
        if(colRef && colRef.current && lazyLoading === false)
            colRef.current.scrollTop = colRef.current?.scrollHeight
    }, [messages]);
    useEffect(() => {
        if(currentConversation && Array.isArray(currentConversation?.messages)){
            dispatch(sortMessages());
            setMessages(currentConversation?.messages);
        }
        if(colRef && colRef.current && lazyLoading === false)
            colRef.current.scrollTop = colRef.current?.scrollHeight
    }, [currentConversation?.messages]);
    return (
        (defaultView) ? 
            <Row>
                <Col xs='3'></Col>
                <Col className="mt-5 lead default-view-column">
                    <span className="mt-auto">Click a conversation</span>
                </Col>
                <Col  xs='3'></Col>
            </Row>
        : (
            <Col ref={colRef} onScroll={handleScroll} className="ul col-messages-list">
                {messages.map((message, idx) => {
                    return (
                        <Row  key={message.id + "row"} className="messages-list-item">
                            <MessageListItem key={message.id} message={message} isBottom={(idx >= (messages.length - 1))}></MessageListItem>
                        </Row>
                    )
                    }
                )}
            </Col>  
        )
    )
}

MessagesListView.propTypes = {
    defaultView: PropTypes.bool
}