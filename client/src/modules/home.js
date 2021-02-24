import React from 'react'; 
import {
    selectShowConvList
} from '../store/slices/conversationsSlice'; 
import ChatSocket from '../components/socket/chatSocket';
import { Container } from 'react-bootstrap'; 
import ChatContainer from '../components/chat/ChatContainer';
import { useSelector } from 'react-redux'; 
import Sidebar from '../components/sidebar/Sidebar';

export default function Home(){ 
    const showConvList = useSelector(selectShowConvList)
    return (showConvList) ? (<Sidebar></Sidebar>) :
    (
      <div className="w-100 h-100">
        <ChatSocket></ChatSocket>
        <Sidebar></Sidebar>
        <Container fluid className="w-100 h-100">
          <ChatContainer className="w-100 h-100"></ChatContainer>
        </Container>
      </div>
    )
  }   