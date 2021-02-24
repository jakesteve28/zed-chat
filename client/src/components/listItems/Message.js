import React, { useState }  from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types'; 
import { selectAccount } from '../../store/slices/accountSettingsSlice';
import { Typography } from '@material-ui/core'; 
import MessageDropdown from '../dropdowns/Message'; 
import useWindowSize from '../../util/windowSize';
import './listitems.css';
import '../topbar/topbar.css';
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// returns: 
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
    const date = getDateMetaData(message.createdAt); 
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
    const date = getDateMetaData(message.createdAt); 
    const [showMenu, setShowMenu] = useState(false);
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


export default function MessageListItem({ message, isBottom }) {
    const account = useSelector(selectAccount);
    const isSender = (message.user.id === account.id); 
    return (isSender) ? (
           <MessageMe message={message} isBottom={isBottom}></MessageMe>
    ) : (
           <MessageOther message={message}></MessageOther>
    )
}

MessageMe.propTypes = {
    message: {
        read: PropTypes.bool, 
        createdAt: PropTypes.string,
        body: PropTypes.string, 
        user: PropTypes.object
    }, 
    isBottom: PropTypes.bool
}
MessageOther.propTypes = {
    message: {
        read: PropTypes.bool, 
        createdAt: PropTypes.string,
        body: PropTypes.string, 
        user: PropTypes.object
    }, 
}
MessageListItem.propTypes = {
    message: {
        read: PropTypes.bool, 
        createdAt: PropTypes.string,
        body: PropTypes.string, 
        user: PropTypes.object
    }, 
    isBottom: PropTypes.bool
}