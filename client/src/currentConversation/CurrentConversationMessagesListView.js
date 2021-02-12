import React, { useEffect, useState, useRef } from 'react' 
import { Row, Col, Container, Spinner, Button, Dropdown } from 'react-bootstrap'
import useWindowSize from '../sidebar/windowSize'
import { 
    selectCurrentConversation,
    sortMessages,
    batchAddMessages
} from './conversationsSlice'
import {
    selectAccount
} from '../account/accountSettingsSlice'
import { useSelector, useDispatch } from 'react-redux'
import './messages.css'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import '../sidebar/sidebar.css'; //For the dropdown, this is rreally lazy
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import FlagIcon from '@material-ui/icons/Flag';
import { Typography } from '@material-ui/core'
import {
    selectHost
} from '../store/store';
import { selectToken } from '../auth/authSlice';

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function MessageDropdown({ sentByMe, deleteMessage, pinMessage }){
    return (<Dropdown className={(sentByMe) ? "msg-dropdown message-dropdown-sender light-hover" : "msg-dropdown message-dropdown-received light-hover"}  drop={(sentByMe) ? "left" : "right"} >              
                <Dropdown.Toggle 
                    as={Button} variant="dark" className="message-menu-button">
                    <MoreVertIcon></MoreVertIcon>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ backgroundColor: "#222222", minWidth: "80px"} } className="my-dropdown-message shadow text-white text-center">        
                    <Dropdown.Item  
                        className="text-white shadow dropdown-item-message" 
                        as="button" onClick={ 
                            (e) =>
                            {
                                e.preventDefault();
                                e.stopPropagation();
                                if(pinMessage) pinMessage();
                            }}>
                        Pin&nbsp;<FlagIcon></FlagIcon>
                    </Dropdown.Item>    
                    {
                        (sentByMe) ?  <Dropdown.Item  
                                        className="text-white shadow dropdown-item-message" 
                                        as="button" onClick={ 
                                            (e) =>
                                            {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if(deleteMessage) deleteMessage();
                                            }}>
                                        Delete&nbsp;<DeleteOutlineIcon></DeleteOutlineIcon>
                                    </Dropdown.Item> : ""
                    }
                </Dropdown.Menu>
            </Dropdown>)
}


// object looks like: 
// {
//     hour: number (0-12),
//     min: number (0-60),
//     pm: undefined (bool),
//     day: number (0-31),
//     minsAgo
// }
export const getDateMetaData = (createdAt) => {
    const date = new Date(Date.parse(createdAt));
    return {
        hour: date.getHours(),
        min: date.getMinutes(),
        pm: (date.getHours() > 12),
        day: (date.getTime() < Date.now() - 86400000) ? weekdays[date.getDay()] : "",
        minsAgo: ((Date.now() - date) / 1000 ) / 60
    }
}

//Component for a message from me 
export function MessageMe({ message, isBottom }) {
    const [date, setDate] = useState(getDateMetaData(message.createdAt)); 
    const [showMenu, setShowMenu] = useState(false);
    const size = useWindowSize();
    const pinMessage = () => {
        alert('message pinned');
    }
    const deleteMessage = () => {
        alert('message del');
    }
    return (
        <Container key={Math.random()} className="mt-2 mb-2" style={{ marginTop: "auto", minHeight: "80px" }} fluid>
            <Row onMouseLeave={() => setShowMenu(false) }>
                <Col xs="12" className="text-right pr-2">
                    <Container fluid className={(size.width > 768) ? "pr-5" : ""}>
                        <Row>
                            <Col className="text-right message-me-column" onMouseEnter={() => { setShowMenu(true)}} >
                                <Typography className="p-2 m-1 text-white text-left message-from-me message-column" style={{ borderRadius: "18px 18px 5px 18px", display:"block", backgroundColor: "#3266a8", wordWrap: "break-word"}}>{message.body}</Typography>
                            </Col>
                            <Col xs="1" style={{maxWidth: "20px" }} className="text-right">
                                {(showMenu) ? <MessageDropdown sentByMe={true} pinMessage={pinMessage} deleteMessage={deleteMessage}></MessageDropdown>: ""}
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
            {
                (showMenu || isBottom) ? (
                    <Row style={{ opacity: 0.8 }}>
                        <Col xs="12" className="text-right pr-3">
                            <Container fluid className={(size.width > 768) ? "pr-5" : ""}>
                                <Row>
                                    <Col xs={(size.width > 768 ? "8" : "6")} className="text-center">
                                    </Col>
                                    <Col className="text-right">
                                        <span style={{ opacity: 0.7, fontSize: "10pt" }} className="font-italic text-left text-white text-small">
                                            {`${(message.read === true ) ? "Read - " : " Delivered - "}`}
                                            {(date.minsAgo < 60) ? 
                                                `${(date.minsAgo.toFixed() > 0) ? date.minsAgo.toFixed() + " mins ago" : "Now"}`  
                                                : `${(date.day) ? date.day + ", " : "Today, "}${date.hour}:${(date.min < 10) ? "0" + date.min : date.min}${(date.pm) ? "PM" : "AM"}`}
                                        </span>
                                    </Col>     
                                </Row>
                            </Container>
                        </Col>                   
                    </Row>
                ) : ""
            }
        </Container>
    ) 
}

//Component for a message from someone else
export function MessageOther({ message }) {
    const [date, setDate] = useState(getDateMetaData(message.createdAt)); 
    const [showMenu, setShowMenu] = useState(false);
    const size = useWindowSize();
    const dispatch = useDispatch();
    const pinMessage = () => {
        alert('message pinned');
    }
    return (
        <Container key={Math.random()} className="mt-2 mb-2 p-1"  style={{ marginTop: "auto", minHeight: "80px" }} fluid>
         <Row onMouseLeave={() => setShowMenu(false) }>
                <Col xs="12" className="text-left">
                    <Container fluid>
                        <Row>
                            <Col xs="1" style={{maxWidth: "20px" }} className="text-left">
                                {(showMenu) ? <MessageDropdown pinMessage={pinMessage} sentByMe={false}></MessageDropdown>: ""}
                            </Col>
                            <Col className="text-left message-me-column" onMouseEnter={() => { setShowMenu(true)}} >
                                <Typography className="p-2 m-1 text-white text-left message-from-other message-column" style={{ borderRadius: "5px 18px 18px 18px", display:"block", backgroundColor: "#1E3D64", wordWrap: "break-word"}}>{message.body}</Typography>
                            </Col>  
                        </Row>
                    </Container>
                </Col>   
        </Row>
        <Row style={{ opacity: 0.8, maxHeight: "10px" }}>
            <Col xs="9" className="text-left pl-4 pt-2" style={{ opacity: 0.7 }}>
                <span className="font-italic text-left text-white">
                <span style={{ opacity: 0.7, fontSize: "10pt" }}  className="text-white text-small">{`@${message.user.tagName} `}</span>
                {(date.minsAgo < 60) ? `- ${(date.minsAgo.toFixed() > 0) ? 
                    date.minsAgo.toFixed() + " mins ago" : "Now"}`  
                    : `- ${(date.day) ? date.day + ", " : "Today, "}${date.hour}:${(date.min < 10) ? "0" + date.min : date.min} ${(date.pm) ? "PM" : "AM"}`}
                </span>
            </Col>
            <Col xs="3" className="text-center">
            </Col>
       </Row>
    </Container>)
}

function MessageListItem({ message, isBottom }) {
    const account = useSelector(selectAccount);
    const isSender = (message.user.id === account.id); 
    return (isSender) ? (
           <MessageMe message={message} isBottom={isBottom}></MessageMe>
    ) : (
           <MessageOther message={message}></MessageOther>
    )
}

export default function CurrentConversationMessagesListView({ defaultView }){
    const [ isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    let currentConversation = useSelector(selectCurrentConversation);
    const account = useSelector(selectAccount);
    const host = useSelector(selectHost);
    const token = useSelector(selectToken);
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
        const messageResult = await fetch(`${host}/conversation/messages/${currentConversation.id}/range?beforeDate=${currentConversation.messages[0]}&number=25`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        setLoadingMessages(false);
        const { messages } = await messageResult.json(); 
        if(Array.isArray(messages)) {
            if(new Date(messages[messages.length - 1]?.createdAt).getTime() < new Date(currentConversation?.messages[0].createdAt).getTime()) {
                dispatch(batchAddMessages({ messages: messages })); 
            }
        }
    }
    const handleScroll = async () => {
        if(colRef.current){
            if(colRef.current?.scrollHeight <= 100) {
                if(currentConversation?.messages?.length >= 24){
                    setLoadingMessages(true);
                    await lazyLoadMessages();
                }
            }
        }
    }
    useEffect(() => {
        if(currentConversation && currentConversation.messages){
            dispatch(sortMessages());
            setMessages(currentConversation.messages);
        }
        if(colRef && colRef.current)
            colRef.current.scrollTop = colRef.current.scrollHeight
    }, [currentConversation.messages]);
    useEffect(() => {
        if(colRef && colRef.current)
            colRef.current.scrollTop = colRef.current.scrollHeight
    }, [messages]);
    useEffect(() => {
        if(currentConversation && currentConversation.typing !== undefined){
            console.log("setting is typing");
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
                        {
                            (loadingMessages) ? (
                                <Spinner animation="spin" variant="primary" className="mx-auto" />
                            ) : ""
                        }
                        <Col ref={colRef} onScroll={handleScroll} className="ul" style={{ 
                            bottom: 150, 
                            paddingBottom: 50, 
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
                                    <Row className="messages-list-item">
                                        <MessageListItem message={message} isBottom={(idx >= (messages.length - 1))}></MessageListItem>
                                    </Row>
                                )
                                }
                            )}
                        </Col>
                    </Row>
                    {
                    (isTyping) ? (
                    <Row>
                        <Container key={Math.random()} style={{ position: "fixed", bottom: 120 }} className="typing-list-item-container" fluid>
                                <Row className="mt-1 mb-1">
                                <Col xs="1"></Col>
                                <Col xs="9" className="text-left">
                                    <Typography className="p-2 m-1 text-white typing-list-item"
                                        style={{ borderRadius: "18px", 
                                        display:"inline-block", 
                                        whiteSpace: "nowrap", 
                                        backgroundColor: "#1E3D64"}}>
                                        <Spinner animation="grow" size="lg" />&nbsp;
                                        <Spinner animation="grow" size="lg" />&nbsp;
                                        <Spinner animation="grow" size="lg" />
                                    </Typography>
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