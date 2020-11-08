import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import CurrentConversationMessageBox from './CurrentConversationMessageBox';
import CurrentConversationMessagesListView from './CurrentConversationMessagesListView';
import { useSelector } from 'react-redux'
import {
    selectView
  } from './conversationsSlice';
import useWindowSize from '../sidebar/windowSize'

export default function CurrentConversationContainer(){
    const size = useWindowSize();
    const defaultView = useSelector(selectView)
    return (
        (defaultView) ?
        <Container className="" style={{ minHeight: size.height, height: size.height}} fluid>
            <Row>
                <Col xs="12" className="text-center text-muted">
                    <h1>Select a conversation</h1>
                </Col>
            </Row>
        </Container>
        :
        <Container className="" style={{ minHeight: size.height, height: size.height}} fluid>
            <Row style={{ minHeight: size.height, height: size.height}}>
                <CurrentConversationMessagesListView style={{ minHeight: size.height, height: size.height}}></CurrentConversationMessagesListView>
            </Row>
            <Row>
                <CurrentConversationMessageBox></CurrentConversationMessageBox>
            </Row>    
        </Container>
    )
}