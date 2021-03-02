import React from 'react'; 
import { Container } from 'react-bootstrap';
import StartChat from '../components/startchat/StartChat';
import Sidebar from '../components/sidebar/Sidebar';
export default function StartChatScreen(){
  return (
    <div className="w-100 h-100">
      <Sidebar></Sidebar>
      <Container fluid className="w-100 h-100">
        <StartChat></StartChat>
      </Container>
    </div>
  )
}