import React from 'react'; 
import { Container } from 'react-bootstrap';
import NewConversation from '../components/newConversation/NewConversation';
import Sidebar from '../components/sidebar/Sidebar';
export default function NewConversationScreen(){
  return (
    <div className="w-100 h-100">
      <Sidebar></Sidebar>
      <Container fluid className="w-100 h-100">
        <NewConversation></NewConversation>
      </Container>
    </div>
  )
}