import React from 'react'
import { Container, Row } from 'react-bootstrap'
import CurrentConversationMessageBox from './CurrentConversationMessageBox';
import CurrentConversationMessagesListView from './CurrentConversationMessagesListView';
import { useSelector } from 'react-redux'
import {
    selectView
  } from './conversationsSlice';
import useWindowSize from '../sidebar/windowSize'

export default function CurrentConversationContainer(){
    const size = useWindowSize();
    const defaultView = useSelector(selectView);
    return (
        (defaultView) ?
        <Container fluid>
            
        </Container>
        :
        <Container className="pl-3" style={{ minHeight: size.height, height: size.height}} fluid>
            <Row style={{ minHeight: size.height - 150, height: size.height - 150, paddingBottom: 'auto'}}>
                <CurrentConversationMessagesListView defaultView={defaultView} style={{ minHeight: size.height, height: size.height}}></CurrentConversationMessagesListView>
            </Row>
            <Row style={{ minHeight: 20 }}>

            </Row>  
            <Row className="pb-2">
                <CurrentConversationMessageBox></CurrentConversationMessageBox>
            </Row>  
            <Row style={{ minHeight: 20 }}>

            </Row>  
        </Container>
    )
}