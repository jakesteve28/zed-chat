import React, { useState } from 'react';
import { Row, Col, Button, Container, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { 
    setView,
    setShowConvList, 
    setCurrentConversation,
    selectConversations
} from '../../store/slices/conversationsSlice'; 
import { setTopbarMessage } from '../../store/slices/uiSlice';
import { chatSocket } from '../socket/chatSocket';
import useWindowSize from '../../util/windowSize';
import ForumIcon from '@material-ui/icons/Forum';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import '../../styles/listitems.css';
import '../../styles/topbar.css';

// const checkConvs = (conversations, tagName) => {
//     for(let conv of conversations) {
//         for(let user of conv.users){
//             if(user.tagName === tagName) return true;
//         }
//     } return false;
// }
import { notificationSocket } from '../socket/notificationSocket';

export default function FriendListItem({ 
        account, 
        currentConversation, 
        tagName, 
        conversations, 
        history, 
        dispatch 
    }){
    const size = useWindowSize();
    const [deleteSpinning, setDeleteSpinning] = useState(false); 
    const [chatNavigating, setChatNavigating] = useState(false); 
    const friendAction = () => {
        try {
            if(chatNavigating) return;
            if(conversations.length > 0){
                for(let conv of conversations) {
                    //Navigate to the first conversation containing them
                    if(conv.pending === false && conv.users.some(user => user.tagName === tagName)){        
                        setChatNavigating(true);   
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
                        if(location.pathname !== '/home'){
                            history.push('/home');
                        }
                        setChatNavigating(false);   
                        break;
                    }
                }
            } else {
                if(location.pathname){
                    history.push('/newConversation');
                }
                setChatNavigating(false);   
            }
        } catch(err) {
            console.error(`Error while navigating to conversation with friend`);
            setChatNavigating(false);
        }   
    }
    const deleteFriend = () => {
        try {
            if(deleteSpinning) return;
            setDeleteSpinning(true);
            if(notificationSocket) {
                notificationSocket.emit('removeFriend', { senderId: account.id, tagName: tagName }, () => {
                    console.log('Successfully emitted remove friend notification'); 
                }); 
            }
            setDeleteSpinning(false);
        } catch(err) {
            console.error(`Error while sending remove friend notification to server ${err}`); 
            setDeleteSpinning(false);
        }
    }
    return (
        <Container className="friend-list-item-row" fluid>
            <Row className="text-secondary p-2">
                <Col className="text-left pl-2">@{tagName}</Col>
                <Col className="text-left" style={{ display: "inline" }}>
                    {
                        (chatNavigating) ? 
                        <Spinner size="sm" animation="border" variant="secondary" /> 
                        :
                        <Button className="text-white hidden-dropdown-friend-list-item" variant="dark" onClick={() => friendAction()}><ForumIcon /></Button>
                    }
                    {
                        (deleteSpinning) ? 
                        <Spinner size="sm" animation="border" variant="secondary" />
                        :
                        <Button className="text-danger hidden-dropdown-friend-list-item" variant="dark" onClick={() => deleteFriend()}><DeleteOutlineIcon /></Button>
                    }
                </Col>
            </Row>
        </Container>
    )
}

FriendListItem.propTypes = {
    account: PropTypes.object,
    currentConversation: PropTypes.object,
    tagName: PropTypes.string, 
    conversations: PropTypes.arrayOf(PropTypes.object),
    history: PropTypes.object, 
    dispatch: PropTypes.func
}