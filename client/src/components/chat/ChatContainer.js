import React from 'react';
import { Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import ChatBox from './ChatBox';
import MessagesListView from './MessagesListView';
import {
    selectView
  } from '../../store/slices/conversationsSlice';
import useWindowSize from '../../util/windowSize';
export default function ChatContainer(){
    const size = useWindowSize();
    const defaultView = useSelector(selectView);    
    return (
        (defaultView) ?
        <Container fluid>
        </Container>
        :
        <Container className="pl-3" style={{ minHeight: size.height, height: size.height}} fluid>
            <Row style={{ minHeight: size.height - 150, height: size.height - 150, paddingBottom: 'auto'}}>
                <MessagesListView defaultView={defaultView} style={{ minHeight: size.height, height: size.height}}></MessagesListView>
            </Row>
            <Row style={{ minHeight: 20 }}>

            </Row>  
            <Row className="pb-2">
                <ChatBox></ChatBox>
            </Row>  
            <Row style={{ minHeight: 20 }}>

            </Row>  
        </Container>
    )
}