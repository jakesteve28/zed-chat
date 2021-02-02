import React, { useEffect, useState, useRef } from 'react' 
import { Row, Col, Container, Spinner, Button, Dropdown } from 'react-bootstrap'
import useWindowSize from '../sidebar/windowSize'
import { 
    selectCurrentConversation
} from './conversationsSlice'
import {
    selectAccount
} from '../account/accountSettingsSlice'
import { useSelector } from 'react-redux'
import './messages.css'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import '../sidebar/sidebar.css'; //For the dropdown, this is rreally lazy
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function MessageDropdown({ sentByMe }){

    return (<Dropdown className={`${(sentByMe) ? "message-dropdown-sender light-hover" : "message-dropdown-received light-hover"}`}>              
                <Dropdown.Toggle 
                    as={Button} variant="dark" className="message-menu-button">
                    <MoreVertIcon></MoreVertIcon>
                </Dropdown.Toggle>
                <Dropdown.Menu align={(sentByMe) ? "right" : "left"} style={{ backgroundColor: "#222222", minWidth: "100px"} } className="my-dropdown-message shadow text-white text-center">        
                    <Dropdown.Item  
                        className="text-white shadow dropdown-item-message" 
                        as="button" onClick={ 
                            (e) =>
                            {
                                e.preventDefault();
                                e.stopPropagation();
                            }}>
                        Delete&nbsp;<DeleteOutlineIcon></DeleteOutlineIcon>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>)
}

function MessageListItem({ message }) {
    const account = useSelector(selectAccount);
    const dateNow = Date.now()
    const date = Date.parse(message.createdAt)
    const stdDate = new Date(date);
    const dateMeta = {
        hour: undefined,
        min: undefined,
        pm: undefined,
        day: undefined,
    }
    dateMeta.hour = stdDate.getHours();
    dateMeta.min = stdDate.getMinutes();
    if(dateMeta.hour > 12){
        dateMeta.pm = true;
        dateMeta.hour -= 12;
    }
    if(stdDate.getTime() < (dateNow - 86400000)){
        dateMeta.day = weekdays[stdDate.getDay()];
    }
    const minsAgo = ((dateNow - date) / 1000 ) / 60;
    const isSender = (message.user.id === account.id); 
    const [showMenu, setShowMenu] = useState(false);
    let timeoutId = null; 
    const size = useWindowSize();
    return (isSender) ? (
            //Message from me
            <Container key={Math.random()} className="mt-2 mb-2" style={{ marginTop: "auto", minHeight: "80px" }} fluid>
                <Row onMouseLeave={() => setShowMenu(false) }>
                    <Col xs="12" className="text-right">
                        <Container fluid>
                            <Row>
                                <Col xs={(size.width > 768) ? "8" : "6"} className="text-right">
                                    {(showMenu) ? <MessageDropdown sentByMe={true}></MessageDropdown>: ""}
                                </Col>
                                <Col xs={(size.width > 768) ? "4" : "6"} className="text-right" onMouseEnter={() => { setShowMenu(true)}} >
                                    <div className="p-2 m-1 text-white text-left message-from-me" style={{borderRadius: "18px", display:"block", backgroundColor: "#3266a8", wordWrap: "break-word"}}>{message.body}</div>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>
                {
                    (showMenu) ? (
                        <Row style={{ opacity: 0.8 }}>
                            <Col xs="12" className="text-right pr-3">
                                <Container fluid>
                                    <Row>
                                        <Col xs={(size.width > 768 ? "9" : "6")}  xs="9" className="text-center">
                                        </Col>
                                        <Col xs={(size.width > 768 ? "3" : "6")} xs="3" className="text-left">
                                            <span className="font-italic text-left text-white">
                                                {(date > (dateNow - 360000)) ? `- ${(minsAgo.toFixed() > 0) ? minsAgo.toFixed() + " mins ago" : "Now"}`  : `${(dateMeta.day) ? dateMeta.day + ", " : "Today, "}${dateMeta.hour}:${(dateMeta.min < 10) ? "0" + dateMeta.min : dateMeta.min} ${(dateMeta.pm) ? "PM" : "AM"}`}
                                            </span>
                                        </Col>     
                                    </Row>
                                </Container>
                            </Col>                   
                        </Row>
                    ) : ""
                }
            </Container>
            ) :
            //Message from someone else
            (<Container key={Math.random()} className="mt-2 mb-2 p-1"  style={{ marginTop: "auto", minHeight: "80px" }} fluid>
                 <Row onMouseLeave={() => setShowMenu(false) }>
                    <Col xs="12" className="text-left">
                        <Container fluid>
                            <Row>
                                <Col xs={(size.width > 768 ? "3" : "6")} style={{ maxWidth: (size.width > 768) ? "605px" : "300px",  minWidth: (size.width > 768) ? "200px" : "160px", width: "wrap-content"}} onMouseEnter={() => { setShowMenu(true)}} className="text-left">
                                    <div className="p-2 m-1 text-white text-left message-from-other" style={{borderRadius: "18px", display:"block", backgroundColor: "#404040", wordWrap: "break-word"}}>{message.body}</div>
                                </Col>
                                <Col xs={(size.width > 768 ? "9" : "6")} className="text-left">
                                {
                                    //<Button className="message-menu-button"><MoreVertIcon></MoreVertIcon></Button>
                                    (showMenu) ? <MessageDropdown sentByMe={false}></MessageDropdown> : ""
                                }
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>
                <Row style={{ opacity: 0.8, maxHeight: "10px" }}>
                    <Col xs="9" className="text-left pl-4 pt-2">
                        <span className="font-italic text-left text-white">
                        <span className="text-white">{`@${message.user.tagName} `}</span>
                        {(date > (dateNow - 360000)) ? `- ${(minsAgo.toFixed() > 0) ? minsAgo.toFixed() + " mins ago" : "Now"}`  : `- ${(dateMeta.day) ? dateMeta.day + ", " : "Today, "}${dateMeta.hour}:${(dateMeta.min < 10) ? "0" + dateMeta.min : dateMeta.min} ${(dateMeta.pm) ? "PM" : "AM"}`}
                        </span>
                    </Col>
                    <Col xs="3" className="text-center">
                    </Col>
               </Row>
            </Container>)
}

export default function CurrentConversationMessagesListView(props){
    const [ isTyping, setIsTyping] = useState(false)
    const [messages, setMessages] = useState([])
    let defaultView = props.defaultView
    let currentConversation = useSelector(selectCurrentConversation);
    const account = useSelector(selectAccount)
    const size = useWindowSize()
    const colRef = useRef()
    if(!currentConversation) currentConversation = {}
    let rowHeight = size.height - (size.height / 8);
    if(isNaN(rowHeight)){
        rowHeight = window.innerHeight - (window.innerHeight / 8)
    }
    if(colRef && colRef.current)
            colRef.current.scrollTop = colRef.current.scrollHeight
    useEffect(() => {
        if(currentConversation && currentConversation.messages){
            const msgs = [...currentConversation.messages]
            setMessages(msgs.sort((a , b) => {
                    return Date.parse(a.createdAt) - Date.parse(b.createdAt)
                }
            ))
        }
        if(colRef && colRef.current)
            colRef.current.scrollTop = colRef.current.scrollHeight
    }, [currentConversation.messages])
    useEffect(() => {
        if(colRef && colRef.current)
            colRef.current.scrollTop = colRef.current.scrollHeight
    }, [messages])
    useEffect(() => {
        if(currentConversation && currentConversation.typing !== undefined){
            setIsTyping(currentConversation.typing)
        }
    }, [currentConversation.typing])
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
                        <Col ref={colRef} className="ul" style={{ 
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
                            {messages.map((message) =>
                                (
                                    <Row>
                                    <MessageListItem message={message}></MessageListItem>
                                    </Row>
                                )
                            )}
                        </Col>
                    </Row>
                    {
                    (isTyping) ? (
                    <Row>
                        <Container  key={Math.random()} style={{ position: "fixed", bottom: 135 }} fluid>
                                <Row className="mt-1 mb-1">
                                <Col xs="1"></Col>
                                <Col xs="9" className="text-left">
                                    <div className="p-2 m-1 text-white" style={{ borderRadius: "18px", display:"inline-block", whiteSpace: "nowrap", backgroundColor: "#404040"}}><Spinner animation="grow" size="sm" />&nbsp;<Spinner animation="grow" size="sm" />&nbsp;<Spinner animation="grow" size="sm" />
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