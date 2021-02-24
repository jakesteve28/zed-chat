import React, { useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
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
import "./sidebar.css";

const getMinWidthListItem = (narrowScreen, deleted, showConvList) => {
    if((narrowScreen || deleted) && showConvList){
        //Only show conversation list, aka sidebar
        return "450px";
    } else if(narrowScreen && !showConvList) {
        //Only show current conversation, hide sidebar  
        return "0px";
    } else if(!narrowScreen && !showConvList) {
        //Narrow sidebar for wider screens
        return "200px";
    } else {
        return "200px";
    } 
}

const getButtonMargin = (narrowScreen, showConvList) => {
    if(narrowScreen && showConvList){
        //Only show conversation list, aka sidebar
        return "150px";
    } else if(narrowScreen && !showConvList) {
        //Only show current conversation, hide sidebar  
        return "0px";
    } else if(!narrowScreen && !showConvList) {
        //Narrow sidebar for wider screens
        return "-5px";
    } else {
        return "-5px";
    } 
}

const useStyles = makeStyles(() => ({
    animate_in: {
        width: 0,
        visibility: "invisible",
        flexShrink: 0,
        animationName: "fadeout",
        animationDuration: "1s"
    },
    animate_out: {
        width: "200px",
        flexShrink: 0,
        animationName: "fadeout",
        animationDuration: "1s"
    },
    '@keyframes fadeout': {
        '0%': {
            width: "25%"
        },
        '100%': {
            width: 0,
            display: "none",
            opacity: 1
        },
    },
    '@keyframes fadein': {
        '0%': {
            width: 0,
            opacity: 0
        },
        '100%': {
            width: "25%",
            opacity: 1
        }
    },
    narrowPaper: {
        minWidth: "240px",
        maxWidth: "240px",
        backgroundColor: "#222222",
        opacity: 0.8
      },
    hidePaper: {
        backgroundColor: "#222222",
        width: "0%",
    },
    fullDrawerPaper: {
        width: "100%",
        backgroundColor: "#222222"
    },
    drawerContainer: {
      backgroundColor: "#222222",
      color: "white",
      paddingRight: "20px",
      overflowX: "hide"
    },
}));

export default function Sidebar(){
    const size = useWindowSize();
    const classes = useStyles();
    const narrowScreen = size.width < 768;
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

    const getPaper = () => {
        if((narrowScreen || deleted) && showConvList){
            //Only show conversation list, aka sidebar
            return classes.fullDrawerPaper;
        } else if(narrowScreen && !showConvList) {
            //Only show current conversation, hide sidebar  
            return classes.hidePaper;
        } else if(!narrowScreen && !showConvList) {
            //Narrow sidebar for wider screens
            return classes.narrowPaper;
        } else {
            return classes.narrowPaper;
        }  
    }

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
        if(currentConversation && (currentConversation.id === convId)){
            dispatch(setShowConvList(true)); 
            dispatch(setTopbarMessage(""));
            setDeleted(true);
        }
        dispatch(removeConversation({ id: convId }));
    }

    if(Array.isArray(conversations) && conversations.length > 1){
        conversations = conversations.filter((value, index, self) => {
            return self.indexOf(value) === index;
        })
    }
    
    const listItemMinWidth = getMinWidthListItem(narrowScreen, deleted, showConvList);
    const buttonMargin = getButtonMargin(narrowScreen, showConvList);
    return (
        <Drawer
            variant="permanent"
            classes={{
                paper: getPaper()
            }}
        >
            <Toolbar />
            <div className={classes.drawerContainer}>
                <List style={{ opacity: 0.8 }}>
                <ListItem style={{ maxWidth: "500px", maxHeight: "120px" }} className="text-small text-center mx-auto" selected={false} key='sidebar-search'>
                   <Container fluid>
                        <InputGroup className="mx-auto">
                                <FormControl
                                    style={{ textAlign: "center" }}
                                    placeholder="Search"
                                    aria-label="Search"
                                    aria-describedby="basic-addon1"
                                    onChange={ e => setSearchBar(e.target.value) }
                                    className="mx-auto lead form-control-custom"
                                    autoComplete="new-password"
                                />  
                                <InputGroup.Append style={{ maxWidth: "30px" }}>
                                    <Tooltip title="Search Chat Names">
                                        <Button variant="dark" onClick={() => searchChatNames()} className="custom-sidebar-search-button" style={{ backgroundColor: "#404040", border: "none" }}><SearchOutlined className={(error) ? "error-icon" : ""} style={{ color: "#EEEEEE" }}></SearchOutlined></Button>
                                    </Tooltip>
                                    {
                                      (searchScreen) ?  
                                        <Tooltip title="Exit Search">
                                            <Button variant="dark" onClick={() => setSearchScreen(false)} className="custom-sidebar-search-button" style={{ backgroundColor: "#404040", border: "none" }}>X</Button>
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
                                        buttonMargin={buttonMargin} 
                                        selected={currentConversation.conversationName === conversation.conversationName} 
                                        minWidth={listItemMinWidth}
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
                                buttonMargin={buttonMargin} 
                                selected={currentConversation.conversationName === conversation.conversationName} 
                                minWidth={listItemMinWidth}
                                key={conversation.id}
                            />) })
                    }
                </List>
            </div>
        </Drawer>
    )
}