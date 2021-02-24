import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Container, Spinner } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import useWindowSize from '../../util/windowSize';
import { 
    selectCurrentConversation,
    sortMessages,
    batchAddMessages
} from '../../store/slices/conversationsSlice';
import MessageListItem from '../listitems/Message'; 
import './messages.css';
import '../sidebar/sidebar.css'; 

export default function MessagesListView({ defaultView }){
    const [ isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    let currentConversation = useSelector(selectCurrentConversation);
    const size = useWindowSize();
    const colRef = useRef();
    const dispatch = useDispatch();
    if(!currentConversation) currentConversation = {}
    let rowHeight = size.height - (size.height / 8);
    if(isNaN(rowHeight)){
        rowHeight = window.innerHeight - (window.innerHeight / 8)
    }
    const lazyLoadMessages = async () => {
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
            console.log(messages)
            dispatch(batchAddMessages({ messages: messages, conversationId: currentConversation.id }));     
        }
    }
    const handleScroll = async () => {
        if(colRef.current){
            if(colRef.current?.scrollTop <= 100 && loadingMessages !== true) {
                if(currentConversation?.messages?.length < currentConversation?.numberOfMessages){
                    if(loadingMessages === false) {
                        setLoadingMessages(true);
                        await lazyLoadMessages();
                        setLoadingMessages(false);
                    }
                }
            }
        }
    }
    useEffect(() => {
        if(currentConversation && currentConversation.messages){
            dispatch(sortMessages());
            setMessages(currentConversation.messages);
        }
        if(colRef && colRef.current && loadingMessages === false)
            colRef.current.scrollTop = colRef.current.scrollHeight
    }, [currentConversation.messages]);
    useEffect(() => {
        if(colRef && colRef.current && loadingMessages === false)
            colRef.current.scrollTop = colRef.current.scrollHeight
    }, [messages]);
    useEffect(() => {
        if(currentConversation && currentConversation.typing !== undefined){
            console.log("Typing");
            setIsTyping(currentConversation.typing)
        }
    }, [currentConversation.typing]);
    return (
        (defaultView) ? 
            <Row>
                <Col xs='3'></Col>
                <Col className="mt-5 lead" style={{ opacity: 0.87, color: "#404040" }}>
                    <span style={{ marginTop: 'auto' }}>Click a conversation</span>
                </Col>
                <Col  xs='3'></Col>
            </Row>
        :
        <Row className="w-100" style={{ marginTop: 75 }}>
            {(size.width > 768 ? <Col style={{ minWidth: "240px", maxWidth: "240px" }}></Col> : "")}
            <Col style={{ paddingLeft: (size.width > 768) ? "0%" : "3%" }}  >
                <Container fluid>
                    <Row style={{ height: rowHeight}}>
                        <Col ref={colRef} onScroll={handleScroll} className="ul" style={{ 
                            bottom: 150, 
                            paddingBottom: 50, 
                            paddingTop: 100,
                            height: rowHeight - 10, 
                            overflowY: "scroll",
                            position: "fixed", 
                            paddingLeft: "20px",
                            paddingRight: "85px",
                            width: (size.width > 768) ? (size.width - 240) : size.width,
                            maxWidth: (size.width > 768) ? (size.width - 240): size.width }}
                        >
                            {messages.map((message, idx) => {
                                return (
                                    <Row  key={message.id + "row"} className="messages-list-item">
                                        <MessageListItem key={message.id} message={message} isBottom={(idx >= (messages.length - 1))}></MessageListItem>
                                    </Row>
                                )
                                }
                            )}
                        </Col>
                    </Row>
                    {
                    (isTyping || loadingMessages) ? (
                    <Row>
                        <Container key={Math.random()} style={{ position: "fixed", bottom: 120 }} className="typing-list-item-container" fluid>
                                <Row className="mt-1 mb-1">
                                <Col xs="1"></Col>
                                <Col xs="9" className="text-left">
                                    <div className="p-2 m-1 text-white typing-list-item"
                                        style={{ borderRadius: "18px", 
                                        display:"inline-block", 
                                        whiteSpace: "nowrap", 
                                        backgroundColor: "#1E3D64"}}>
                                        {
                                            (loadingMessages) ? (
                                                <span>
                                                    <span className='font-italic text-muted' style={{ fontSize: '18pt' }}>Loading Messages</span>
                                                    &nbsp;&nbsp;<Spinner animation="grow" size="lg" />
                                                </span>
                                            ) : ""
                                        } 
                                        {
                                            (isTyping) ? ( 
                                                <span>
                                                    <Spinner animation="grow" size="lg" />
                                                    <Spinner animation="grow" size="lg" />
                                                    <Spinner animation="grow" size="lg" />
                                                </span>) : ""
                                        }   
                                    </div>
                                </Col>
                                <Col xs="3" className="text-center">
                                </Col>
                                </Row>
                                <Row className="" style={{ marginTop: -10 }}>
                                        <Col xs="9" className="text-left pl-4">
                                            <span className="font-italic text-left text-muted"></span>
                                        </Col>
                                        <Col xs="3" className="text-center">
                                        </Col>
                                </Row>
                        </Container>
                    </Row>
                    ) : ""
                    }
                </Container>
            </Col>
        </Row>
    )
}

MessagesListView.propTypes = {
    defaultView: PropTypes.bool
}