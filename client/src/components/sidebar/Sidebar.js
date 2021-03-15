import React, { useState, useEffect } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import useWindowSize from '../../util/windowSize'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Container, InputGroup, FormControl, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { removeConversation, 
    selectConversations, 
    setCurrentConversation, 
    selectShowConvList, 
    setShowConvList, 
    selectCurrentConversation,
    setView  } from '../../store/slices/conversationsSlice';
import { selectAccount } from '../../store/slices/accountSettingsSlice';
import { useHistory, useLocation } from 'react-router-dom';
import { setTopbarMessage } from '../../store/slices/uiSlice';
import { SearchOutlined } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import { chatSocket } from '../socket/chatSocket';
import ChatListItem from '../listItems/Chat'; 
import regex from '../../util/regex';
import { notificationSocket } from '../socket/notificationSocket';
import "../../styles/sidebar.css";

export default function Sidebar(){
    const size = useWindowSize();
    let conversations = useSelector(selectConversations);
    let [filteredConversations, setFilteredConversations] = useState([]);
    const dispatch = useDispatch();
    const showConvList = useSelector(selectShowConvList);
    const account = useSelector(selectAccount);
    const [searchBar, setSearchBar] = useState("");
    const history = useHistory();
    const location = useLocation();
    const currentConversation = useSelector(selectCurrentConversation);
    const [searchScreen, setSearchScreen] = useState(false);
    const [error, setError] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const searchChatNames = () => {
        setError(false);
        if(searchBar.length > 4){
            if(regex.conversationName.test(searchBar) === false) {
                console.log("Input failed for searching a conversation name");
                setError(true);
                return; 
            }
            const anyConvs = conversations.filter(conv => conv.conversationName.includes(searchBar) || searchBar.includes(conv.conversationName));
            if(anyConvs.length > 0) {
                setFilteredConversations(anyConvs);
                setSearchScreen(true);
            } else {
                setError(true);
            }
        } else setError(true);
    }

    const selectConversation = (el) => {
        if(!el.pending){
            console.log("Setting current conversation...", el);
            console.log(history, location);
            setDeleted(false);
            if(location.pathname !== '/home'){
                history.push('/home');
            }
            if(currentConversation.conversationName === el.conversationName){
                //dispatch(setCurrentConversation({conversation: el }));
                dispatch(setView(false)); 
                dispatch(setShowConvList(false));
                return; //Speaks for itself
            }
            if(el && el.conversationName !== '' && size.width > 768 && (currentConversation.conversationName !== el.conversationName)){
                //Wide screen shows name
                dispatch(setTopbarMessage(el.conversationName));
            }  
            if(el && el.conversationName !== '' && size.width <= 768 && (currentConversation.conversationName !== el.conversationName)) {
                //Narrow screen only icon
                dispatch(setTopbarMessage("")); 
            }
            dispatch(setView(false)); //Set NOT default view
            dispatch(setCurrentConversation({conversation: el })); //Speaks for itself
            //Now that we set the current conv, we going to notify server
            if(chatSocket){
                chatSocket.emit('setCurrentConversation', { user: account, conversationId: el.id }, 
                () => console.log("Emitted setCurrentConversation successfully"));
            }
            dispatch(setShowConvList(false)); //Sidebar not showing or narrow
        } else {
            console.log(`Conversation is pending invite accept`, el);
            return;
        }
    }

    const deleteConversation = (convId) => {
        console.log("Deleting Conversation " + convId);
        if(notificationSocket) {
            notificationSocket.emit('deleteConversation', { conversationId: convId }, () => {
                console.log("Successfully emitted deleteConversation event with ID " + convId);
            }); 
        }
        if(currentConversation && (currentConversation.id === convId)){
            history.push('/newConversation'); 
            dispatch(setShowConvList(true)); 
        }
        dispatch(removeConversation({ id: convId }));
    }

    if(Array.isArray(conversations) && conversations.length > 1){
        conversations = conversations.filter((value, index, self) => {
            return self.indexOf(value) === index;
        })
    }

    useEffect(() => {
        if(size.width <= 768 && !showConvList && currentConversation.id === 0) {
            if(history.location.pathname === '/newConversation'){
                console.log(history.location.pathname)
                return;
            }
            dispatch(setShowConvList(true)); 
            dispatch(setTopbarMessage(""));
            return;
        } 
        if(size.width <= 768 && showConvList && currentConversation.id !== 0) {
            dispatch(setShowConvList(false)); 
            return;
        }
        if(size.width > 768 && showConvList === true) {
            dispatch(setShowConvList(false));
            return;
        }
    }, [size.width])

    return (
        <Drawer
            variant="persistent"
            open={true}
            className={(deleted || showConvList) ? "alpha-sidebar full-sidebar" : "alpha-sidebar"}
            transitionDuration={1000}
        >
            <Toolbar />
            <div>
                <List className="sidebar-list">
                    <ListItem className="text-small text-center mx-auto sidebar-chat-list-item" selected={false} key='sidebar-search'>
                        <Container fluid>
                                <InputGroup className="mx-auto">
                                        <FormControl
                                            placeholder="Search"
                                            aria-label="Search"
                                            aria-describedby="basic-addon1"
                                            onChange={ e => setSearchBar(e.target.value) }
                                            className="mx-auto lead form-control-custom sidebar-search-form"
                                            autoComplete="new-password"
                                        />  
                                        <InputGroup.Append className="sidebar-search-button-append">
                                            <Tooltip title="Search Chat Names">
                                                <Button variant="dark" onClick={() => searchChatNames()} className="custom-sidebar-search-button sidebar-search-button"><SearchOutlined className={(error) ? "error-icon sidebar-search-icon" : "sidebar-search-icon"}></SearchOutlined></Button>
                                            </Tooltip>
                                            {
                                            (searchScreen) ?  
                                                <Tooltip title="Exit Search">
                                                    <Button variant="dark" onClick={() => setSearchScreen(false)} className="custom-sidebar-search-button sidebar-search-button">X</Button>
                                                </Tooltip>
                                                : ""
                                            }
                                        </InputGroup.Append>      
                                </InputGroup>
                        </Container>
                    </ListItem>
                    {                           
                    (searchScreen) ? 
                            filteredConversations.map((conversation) => {
                            if(conversation.pending === true){
                                return ""
                            }
                            return ( <ChatListItem
                                        conversation={conversation}
                                        selectConversation={selectConversation}
                                        deleteConversation={deleteConversation}
                                        selected={currentConversation.conversationName === conversation.conversationName} 
                                        key={conversation.id}
                                    />) })
                    :
                        conversations.map((conversation) => {
                            if(conversation.pending === true){
                                return ""
                            }
                            return ( <ChatListItem
                                        conversation={conversation}
                                        selectConversation={selectConversation}
                                        deleteConversation={deleteConversation}
                                        selected={currentConversation.conversationName === conversation.conversationName} 
                                        key={conversation.id}
                            />) })
                    }
                </List>
            </div>
        </Drawer>
    )
}