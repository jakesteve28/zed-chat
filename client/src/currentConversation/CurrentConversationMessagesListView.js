import React, { useEffect, useState, useRef } from 'react' 
import { Row, Col, Container, Button, Spinner } from 'react-bootstrap'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { typing } from './Message.Util';
import { makeStyles } from '@material-ui/core';
import useWindowSize from '../sidebar/windowSize'
import { 
    selectConversations,
    addConversation,
    removeConversation,
    setCurrentConversation,
    selectCurrentConversation
} from './conversationsSlice'
import {
    selectToken
} from '../auth/authSlice'
import {
    selectAccount
} from '../account/accountSettingsSlice'
import { useDispatch, useSelector } from 'react-redux'

import './messages.css'

const useStyles = makeStyles(theme => ({
    root: {
      display: "flex",
      flexWrap: "wrap",
      width: "100%"
    },
    formControl: {
      margin: theme.spacing(1),
      width: "100%"
    },
    selectEmpty: {
      marginTop: theme.spacing(2)
    },
    
  }));


export default function CurrentConversationMessagesListView(props){
    const [ isTyping, setIsTyping] = useState(false)
    const [messages, setMessages] = useState([])
    const [conversation, setConversation] = useState(false)
    const [sorted, setSorted] = useState(false)
    let defaultView = props.defaultView
    const token = useSelector(selectToken)
    let currentConversation = useSelector(selectCurrentConversation);
    const account = useSelector(selectAccount)
    const size = useWindowSize()
    const colRef = useRef()
    if(!currentConversation) currentConversation = {}
    useEffect(() => {
        if(currentConversation && currentConversation.messages){
            const msgs = [...currentConversation.messages]
            setMessages(msgs.sort((a , b) => {
                return Date.parse(a.createdAt) - Date.parse(b.createdAt)
                }
            ))
        }
    }, [currentConversation.messages])
    useEffect(() => {
        if(colRef && colRef.current)
            colRef.current.scrollTop = colRef.current.scrollHeight
    }, [])
    useEffect(() => {
        if(colRef && colRef.current)
            colRef.current.scrollTop = colRef.current.scrollHeight
    }, [currentConversation.messages])
    useEffect(() => {
        if(currentConversation && currentConversation.typing !== undefined){
            setIsTyping(currentConversation.typing)
        }
    }, [currentConversation.typing])
    let rowHeight = size.height - (size.height / 8);
    if(isNaN(rowHeight)){
        rowHeight = window.innerHeight - (window.innerHeight / 8)
    }
    return (
        (defaultView) ? 
            <Row>
            <Col xs='3'></Col>
                <Col className="mt-5 lead" style={{ opacity: 0.87, color: "#404040" }}>
                    Click a conversation
                </Col>
                <Col  xs='3'></Col>
            </Row>
        :
        <Row className="w-100" style={{ marginTop: 75 }}>
            {(size.width > 768 ? <Col xs="3"></Col> : "")}
            <Col xs={(size.width > 768 ? "9" : "12")} className="h-100">
                <Container fluid className="h-100">
                    <Row style={{ height: rowHeight}}>
                        <Col ref={colRef} className="ul" sm={(size.width < 768) ? "10" : "8"} style={{ paddingTop: 75, bottom: 75, height: rowHeight, backgroundColor: "#191919", overflow: "auto", position: "fixed",}}>
                            {messages.map((message) => {
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
                                    switch(stdDate.getDay()){
                                        case 0:  dateMeta.day = "Sunday"; break;
                                        case 1:  dateMeta.day = "Monday"; break;
                                        case 2:  dateMeta.day = "Tuesday"; break;
                                        case 3:  dateMeta.day = "Wednesday"; break;
                                        case 4:  dateMeta.day = "Thursday"; break;
                                        case 5:  dateMeta.day = "Friday"; break;
                                        case 6:  dateMeta.day = "Saturday"; break;
                                        default :  dateMeta.day = undefined; break;
                                    }
                                }
                                const minsAgo = ((dateNow - date) / 1000 ) / 60;
        //                        console.log(dateMeta, stdDate, stdDate.getTime())
                                return (message.user.id === account.id) ? (
                                    <Container key={Math.random()} className="li mt-2 mb-2" style={{ marginTop: "auto" }} fluid>
                                        <Row className="mt-1 mb-1">
                                            <Col xs="3" className="text-center">
                                            </Col>
                                            <Col xs="9" className="text-right">
                                                <div className="rounded-pill p-3 m-1 text-white" style={{ display:"inline-block", whiteSpace: "nowrap", backgroundColor: "#3266a8"}}>{message.body}</div>
                                            </Col>
                                        </Row>
                                    </Container>
                                    ) :
                                    (<Container key={Math.random()}  className="li mt-2 mb-3" fluid>
                                         <Row className="mt-1 mb-1">
                                            <Col xs="8" className="text-left">
                                                <div className="rounded-pill p-3 m-1 text-white" style={{ display:"inline-block", whiteSpace: "nowrap", backgroundColor: "#686868"}}>{message.body}</div>
                                            </Col>
                                            <Col xs="3" className="text-center">
                                            </Col>
                                        </Row>
                                        <Row className="" style={{ marginTop: -7, marginBottom: 10 }}>
                                            <Col xs="9" className="text-left pl-4">
                                                <span className="font-italic text-left text-muted">
                                                <span className="text-primary">{`@${message.user.tagName} `}</span>
                                                {(date > (dateNow - 360000)) ? `- ${(minsAgo.toFixed() > 0) ? minsAgo.toFixed() + " mins ago" : "Now"}`  : `- ${(dateMeta.day) ? dateMeta.day + ", " : "Today, "}${dateMeta.hour}:${(dateMeta.min < 10) ? "0" + dateMeta.min : dateMeta.min} ${(dateMeta.pm) ? "PM" : "AM"}`}
                                                </span>
                                            </Col>
                                            <Col xs="3" className="text-center">
                                            </Col>
                                       </Row>
                                    </Container>)
                            })}
                            {
                                (isTyping) ? (
                                <Container  key={Math.random()} className="li mt-2 mb-2" style={{ marginTop: "auto" }} fluid>
                                    <Row className="mt-1 mb-1">
                                    <Col xs="9" className="text-left">
                                        <div className="rounded-pill p-3 m-1 text-white" style={{ display:"inline-block", whiteSpace: "nowrap", backgroundColor: "#686868"}}><Spinner animation="grow" size="sm" />&nbsp;<Spinner animation="grow" size="sm" />&nbsp;<Spinner animation="grow" size="sm" />
                                        </div>
                                    </Col>
                                    <Col xs="3" className="text-center">
                                    </Col>
                                    </Row>
                                    <Row className="" style={{ marginTop: -10 }}>
                                            <Col xs="9" className="text-left pl-4">
                                                <span className="font-italic text-left text-muted">Test Name is typing</span>
                                            </Col>
                                            <Col xs="3" className="text-center">
                                            </Col>
                                    </Row>
                                </Container>
                                ) : ""
                            }
                        </Col>
                    </Row>
                </Container>
            </Col>
        </Row>
    )
}