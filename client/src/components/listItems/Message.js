import React, { useState }  from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { Typography } from '@material-ui/core'; 
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import useWindowSize from '../../util/windowSize';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { selectAccount } from '../../store/slices/accountSettingsSlice';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import Tooltip from '@material-ui/core/Tooltip';
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
        <Container key={`${message.id}`} className="mt-2 mb-2 msg-me-container" fluid>
            <Row onMouseLeave={() => setShowMenu(false) }>
                <Col xs="12">
                    <Container fluid>
                        <Row className="text-right">
                            <span className="message-span">
                                {
                                    (showMenu) ? (
                                        <div className="message-tooltips">
                                            <Tooltip title="Delete Message">
                                                <DeleteOutlineIcon className="delete-icon" onClick={() => alert("Deleting")}></DeleteOutlineIcon>
                                            </Tooltip>                                
                                            <Tooltip title="Save Message (Max 10)">
                                                <ScheduleIcon className="schedule-icon" onClick={() => alert("Pinning")}></ScheduleIcon>
                                            </Tooltip>
                                        </div>
                                    ) : ``
                                }
                                <Typography onMouseEnter={() => setShowMenu(true)} className="p-2 m-1 text-white text-left message-from-me message-column">{message.body}</Typography>
                            </span>
                        </Row>
                    </Container>
                </Col>
            </Row>
            {
                (showMenu || isBottom) ? (
                    <Row className="opaque">
                        <Col xs="12" className="text-right pr-3">
                            <Container fluid className="message-me-metadata-container">
                                <Row>
                                    <Col className="text-right">
                                        <span className="font-italic text-left text-white text-small message-me-metadata-text">
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
        <Container key={`${message.id}`} className="mt-2 mb-2 p-1 msg-otro-container" fluid>
            <Row onMouseLeave={() => setShowMenu(false) }>
                <Col xs="12">
                    <Container fluid>
                        <Row className="text-left">
                            <span className="message-span-other">
                                <Typography onMouseEnter={() => setShowMenu(true)} className="p-2 m-1 text-white text-left message-from-other message-column">{message.body}</Typography>
                                {
                                    (showMenu) ? (
                                        <div className="message-tooltips">                             
                                            <Tooltip title="Save Message (Max 10)">
                                                <ScheduleIcon className="schedule-icon" onClick={() => pinMessage("Pinning")}></ScheduleIcon>
                                            </Tooltip>
                                        </div>
                                    ) : ``
                                }
                            </span>
                        </Row>
                    </Container>
                </Col>
            </Row>
            <Row className="message-other-row opaque">
                <Col xs="9" className="text-left pl-4 pt-2">
                    <span className="font-italic text-left text-white">
                    <span className="text-white text-small message-other-tagname">{`@${message.user.tagName} `}</span>
                    {(date.minsAgo < 60) ? `- ${(date.minsAgo.toFixed() > 0) ? 
                        date.minsAgo.toFixed() + " mins ago" : "Now"}`  
                        : `- ${(date.day) ? date.day + ", " : "Today, "}${date.hour}:${(date.min < 10) ? "0" + date.min : date.min} ${(date.pm) ? "PM" : "AM"}`}
                    </span>
                </Col>
                <Col xs="3" className="text-center">
                </Col>
            </Row>
        </Container>
    )
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