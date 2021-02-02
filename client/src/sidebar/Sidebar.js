import React, { useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import useWindowSize from './windowSize'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { Container, Row, Col, Dropdown, InputGroup, FormControl, Button } from 'react-bootstrap';
import "./sidebar.css";
import { useDispatch, useSelector } from 'react-redux';
import { removeConversation, selectConversations, setCurrentConversation, selectShowConvList, setShowConvList, selectCurrentConversation  } from '../currentConversation/conversationsSlice';
import { setView } from '../currentConversation/conversationsSlice';
import { selectAccount } from '../account/accountSettingsSlice' ;
import { SearchOutlined } from '@material-ui/icons';
import { useHistory, useLocation } from 'react-router-dom';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InfoIcon from '@material-ui/icons/Info';
import { setTopbarMessage } from '../uiSlice';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import Tooltip from '@material-ui/core/Tooltip';
import { setSidebarState, selectSidebarState } from '../uiSlice';

const useStyles = makeStyles((theme) => ({
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
    const dispatch = useDispatch();
    const showConvList = useSelector(selectShowConvList);
    const account = useSelector(selectAccount);
    const [searchBar, setSearchBar] = useState("");
    const history = useHistory();
    const location = useLocation();
    const currentConversation = useSelector(selectCurrentConversation);
    const sidebarState = useSelector(selectSidebarState);
    const cl = (el) => {
        if(!el.pending){
            console.log("Setting current conversation...", el);
            console.log(history, location);
            if(location.pathname !== '/home'){
                history.push('/home');
            }
            // if(currentConversation.conversationName === el.conversationName){
            //     return;
            // }
            if(el && el.conversationName !== '' && size.width > 768){
                //Wide screen shows name
                dispatch(setTopbarMessage((<span><QuestionAnswerIcon></QuestionAnswerIcon>&nbsp;{el.conversationName}</span>)));
            }  
            if(el && el.conversationName !== '' && size.width <= 768) {
                //Narrow screen only icon
                dispatch(setTopbarMessage((<span><QuestionAnswerIcon></QuestionAnswerIcon></span>))); 
            }
            dispatch(setView(false)); //Set NOT default view
            dispatch(setCurrentConversation(el)); //Speaks for itself
            dispatch(setShowConvList(false)); //Sidebar not showing or narrow
        } else {
            console.log(`Conversation is pending invite accept`, el);
            return;
        }
    }

    const handleDelete = (convId) => {
        console.log("Deleting Conversation " + convId);
        dispatch(removeConversation({ id: convId }));
    }
    const handleLeave = (convId) => {
        console.log("Leaving Conversation " + convId)
    }

    if(Array.isArray(conversations) && conversations.length > 1){
        conversations = conversations.filter((value, index, self) => {
            return self.indexOf(value) === index;
        })
    }
    function getPaper(){
        if(narrowScreen && showConvList){
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
    const handleSearch = () => {
        alert("Searching!");
    }
    const getMinWidthListItem = () => {
        if(narrowScreen && showConvList){
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
    const getButtonMargin = () => {
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
                                    <Tooltip title="Search Chats">
                                        <Button variant="dark" className="custom-sidebar-search-button" style={{ backgroundColor: "#404040", border: "none" }}><SearchOutlined style={{ color: "#EEEEEE" }}></SearchOutlined></Button>
                                    </Tooltip>
                                </InputGroup.Append>      
                        </InputGroup>
                   </Container>
                </ListItem>
                    {                   
                    conversations.map((el) => {
                        // if(convMap.current){
                        //     if(convMap.current[el.id]){
                        //         return ""
                        //     } else {
                        //         convMap.current[el.id] = true;
                        //     }
                        // }
                        if(el.pending === true){
                            return ""
                        }
                        return (
                            <ListItem onClick={() => cl(el)} key={el.id} className="sidebar-list-item light-hover" style={{ backgroundColor: "#222222" }} >
                                <Container fluid style={{ backgroundColor: "#222222" }} className="light-hover" >
                                    <Row style={{ backgroundColor: "#222222" }} className="light-hover">
                                        <Col className="conv-info light-hover" style={{ minWidth: getMinWidthListItem() }}>
                                            <Container fluid className="light-hover">
                                                <Row className="font-italic text-primary" style={{ fontSize: "11pt", minWidth: getMinWidthListItem()  }}>
                                                    {el ? el.conversationName : "Chat Name"}
                                                </Row>
                                                <Row className="w-100" style={{ fontSize: "9pt" }}>
                                                    <div className="ml-1 d-block text-truncate">
                                                        {(el && el.messages && el.messages[0]) ? el.messages[0].body : ""}                  
                                                    </div>
                                                </Row>
                                                <Row className="lead w-100 mt-1" style={{ fontSize: "8pt"}}>
                                                    <div className="ml-1 d-block font-italic">
                                                        {el ? new Date(Date.parse(el.createdAt)).toLocaleString('en-US'): ""}   
                                                    </div>
                                                </Row>
                                            </Container>
                                        </Col>
                                        <Col className="hide-conv-info text-right light-hover" style={{ backgroundColor: "#222222", marginLeft: getButtonMargin() }}>
                                            <Container className="light-hover" style={{ backgroundColor: "#222222" }} fluid>
                                                <Dropdown className="light-hover" style={{ backgroundColor: "#222222", marginLeft: "-20px"}}>              
                                                    <Dropdown.Toggle 
                                                        className="dropdown-toggle-conv-info text-white"
                                                        style={{ border:" none", backgroundColor: "#222222"}} 
                                                        as={Button} variant="dark" id="dropdown-custom-components">
                                                        <MoreVertIcon></MoreVertIcon>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu style={{ backgroundColor: "#222222"}} className="my-dropdown shadow text-white text-center">        
                                                        <Dropdown.Item  
                                                                className="text-white shadow conv-dropdown-item" 
                                                                as="button" onClick={ 
                                                                    (e) =>
                                                                    {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();

                                                                    }}>
                                                                Info&nbsp;<InfoIcon></InfoIcon>
                                                            </Dropdown.Item>    
                                                        <Dropdown.Item  
                                                            className="text-white shadow conv-dropdown-item" 
                                                            as="button" onClick={ 
                                                                (e) =>
                                                                {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleDelete(id);                                                      
                                                                }}>
                                                            Delete&nbsp;<DeleteOutlineIcon></DeleteOutlineIcon>
                                                        </Dropdown.Item>
                                                        <Dropdown.Item  
                                                            className="text-white shadow conv-dropdown-item" 
                                                            as="button" 
                                                            onClick={ 
                                                                (e) => {  
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleLeave(id);
                                                                }}>
                                                            Leave&nbsp;<ExitToAppIcon></ExitToAppIcon>
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Container>
                                        </Col>
                                    </Row>
                                </Container>
                            </ListItem>
                        ) })
                    }
                </List>
            </div>
        </Drawer>
    )
}