import React from 'react';
import { Row, Col, Button, Container } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { 
    setView,
    setShowConvList, 
    setCurrentConversation
} from '../../store/slices/conversationsSlice'; 
import { setTopbarMessage } from '../../store/slices/uiSlice';
import { chatSocket } from '../socket/chatSocket';
import useWindowSize from '../../util/windowSize';
import ForumIcon from '@material-ui/icons/Forum';
import '../../styles/listitems.css';
import '../../styles/topbar.css';

export default function FriendListItem({ 
        account, 
        currentConversation, 
        isOnline, 
        tagName, 
        conversations, 
        history, 
        dispatch 
    }){
    const size = useWindowSize();
    const friendAction = () => {
        if(conversations.length > 0){
            for(let conv of conversations) {
                //Navigate to the first conversation containing them
                if(conv.pending === false){
                    if(location.pathname !== '/home'){
                        history.push('/home');
                    }
                    if(currentConversation.conversationName === conv.conversationName){
                        dispatch(setView(false)); 
                        dispatch(setShowConvList(false));
                        break; 
                    }
                    if(conv && conv.conversationName !== '' && size.width > 768 && (currentConversation.conversationName !== conv.conversationName)){
                        dispatch(setTopbarMessage(conv.conversationName));
                    }  
                    if(conv && conv.conversationName !== '' && size.width <= 768 && (currentConversation.conversationName !== conv.conversationName)) {
                        dispatch(setTopbarMessage("")); 
                    }
                    dispatch(setView(false))
                    dispatch(setCurrentConversation({ conversation: conv }));
                    dispatch(setShowConvList(false));
                    if(chatSocket){
                        chatSocket.emit('setCurrentConversation', { user: account, conversationId: conv.id }, 
                        () => console.log("Emitted setCurrentConversation successfully"));
                    }
                    break;
                }
            }
        } else {
            if(location.pathname){
                history.push('/newConversation');
            }
        }
    }
    return (
        <Container className="friend-list-item-row" fluid>
            <Row className="p-3">
                <Col xs="8" className={`${(isOnline) ? "text-success" : "text-danger"} py-auto font-italic text-sm text-center my-auto opaque`}>
                    <span className="">@{tagName}</span>
                </Col>
                <Col xs="4" className="text-left">
                    <Button className="dropdown-toggle text-white hidden-dropdown-friend-list-item" variant="dark" onClick={() => friendAction()}><ForumIcon></ForumIcon></Button>
                </Col>
            </Row>
        </Container>
    )
}

FriendListItem.propTypes = {
    account: PropTypes.object,
    currentConversation: PropTypes.object,
    isOnline: PropTypes.bool,
    tagName: PropTypes.string, 
    conversations: PropTypes.arrayOf(PropTypes.object),
    history: PropTypes.object, 
    dispatch: PropTypes.func
}