import React from 'react'; 
import {
    selectShowConvList
} from '../currentConversation/conversationsSlice'; 
import ChatSocket from '../socket/chatSocket';
import { Container } from 'react-bootstrap'; 
import CurrentConversationContainer from '../currentConversation/CurrentConversationContainer';
import { useSelector } from 'react-redux'; 
import Sidebar from '../sidebar/Sidebar';

export default function Home(){ 
    const showConvList = useSelector(selectShowConvList)
    return (showConvList) ? (<Sidebar></Sidebar>) :
    (
      <div className="w-100 h-100">
        <ChatSocket></ChatSocket>
        <Sidebar></Sidebar>
        <Container fluid className="w-100 h-100">
          <CurrentConversationContainer className="w-100 h-100"></CurrentConversationContainer>
        </Container>
      </div>
    )
  }   