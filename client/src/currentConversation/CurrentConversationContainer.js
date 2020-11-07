import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-bootstrap'
import CurrentConversationMessageBox from './CurrentConversationMessageBox';
import CurrentConversationMessagesListView from './CurrentConversationMessagesListView';
import { useSelector,useDispatch } from 'react-redux'
import {
    addMessage,
    selectConversations,
    selectCurrentConversation
  } from './conversationsSlice';
import useWindowSize from '../sidebar/windowSize'
import io from 'socket.io-client'
import { selectAccount } from '../account/accountSettingsSlice';
import { selectToken } from '../auth/authSlice';

export default function CurrentConversationContainer(){
    const conversations = useSelector(selectConversations)
    const currentConversation = useSelector(selectCurrentConversation)
    const size = useWindowSize();
    const account = useSelector(selectAccount)
    const token = useSelector(selectToken)
    const [socketConnected, setSocketConnected] = useState(false)
    let [socket, setSocket] = useState({})
    const dispatch = useDispatch()
    return (
        <Container className="" style={{ minHeight: size.height, height: size.height}} fluid>
            <Row style={{ minHeight: size.height, height: size.height}}>
                <CurrentConversationMessagesListView style={{ minHeight: size.height, height: size.height}}></CurrentConversationMessagesListView>
            </Row>
            <Row>
                <CurrentConversationMessageBox socket={socket}></CurrentConversationMessageBox>
            </Row>    
        </Container>
    )
}