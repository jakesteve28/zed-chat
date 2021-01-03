import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import CurrentConversationMessageBox from './CurrentConversationMessageBox';
import CurrentConversationMessagesListView from './CurrentConversationMessagesListView';
import { useSelector } from 'react-redux'
import {
    selectView
  } from './conversationsSlice';
import useWindowSize from '../sidebar/windowSize'
import { ReactComponent as ReactLogo } from '../logo.svg'

export default function CurrentConversationContainer(){
    const size = useWindowSize();
    const defaultView = useSelector(selectView)
    return (
        (defaultView) ?
        <Container className="" style={{ paddingLeft: "200px", paddingTop: "150px", minHeight: size.height - 150, height: size.height - 150}} fluid>
            <Row className="text-center">
                <Col className="mx-auto">
                   {(size.width > 768) ? <ReactLogo></ReactLogo> : ""}
                </Col>
            </Row>
            <Row className="text-center">
                <Col className="mx-auto lead text-primary" style={{ opacity: 0.67 }}>
                    {(size.width > 768) ? <h5>Welcome! Add a friend or start a chat</h5> : ""}     
                </Col>
            </Row>
        </Container>
        :
        <Container className="" style={{ minHeight: size.height, height: size.height}} fluid>
            <Row style={{ minHeight: size.height, height: size.height}}>
                <CurrentConversationMessagesListView defaultView={defaultView} style={{ minHeight: size.height, height: size.height}}></CurrentConversationMessagesListView>
            </Row>
            <Row>
                <CurrentConversationMessageBox></CurrentConversationMessageBox>
            </Row>    
        </Container>
    )
}