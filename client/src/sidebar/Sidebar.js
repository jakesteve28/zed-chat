import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import useWindowSize from './windowSize'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { Container, Row, Col, Dropdown } from 'react-bootstrap';
import "./sidebar.css";
import { useDispatch, useSelector } from 'react-redux';
import { removeConversation, selectConversations, setCurrentConversation, selectShowConvList, setShowConvList  } from '../currentConversation/conversationsSlice';
import { setView } from '../currentConversation/conversationsSlice';
import SelectableContext from "react-bootstrap/SelectableContext";
import { chatSocket } from '../socket/chatSocket';
import { selectAccount } from '../account/accountSettingsSlice' ;

const useStyles = makeStyles((theme) => ({
    animate_in: {
        width: 0,
        visibility: "invisible",
        flexShrink: 0,
        animationName: "fadeout",
        animationDuration: "1s"
    },
    animate_out: {
        width: "25%",
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
    drawerPaper: {
        width: "25%",
        backgroundColor: "#222222",
      },
      hidePaper: {
        backgroundColor: "#222222",
        width: "0%",
      },
    drawerContainer: {
      //overflow: 'ellipsis',
      backgroundColor: "#222222",
      color: "white"
    },
    fullDrawerPaper: {
        width: "100%",
        backgroundColor: "#222222"
    },
    listItem: {
        "&:hover": {
            backgroundColor: "#404040"
          }
    }
  }));



export default function Sidebar(){
    const size = useWindowSize();
    const classes = useStyles();
    const sidebar = size.width < 768;
    let conversations = useSelector(selectConversations);
    const dispatch = useDispatch();
    const showConvList = useSelector(selectShowConvList);
    const account = useSelector(selectAccount);
    const cl = (el) => {
        if(!el.pending){
            console.log("Setting current conversation...", el);
            dispatch(setView(false));
            dispatch(setCurrentConversation(el));
            dispatch(setShowConvList(false));
            // if(chatSocket){
            //     console.log("Refreshing chat socket id...", el);
            //     chatSocket.emit('refreshChatSocket', { userId: account.id });
            // }
        } else {
            return;
        }
    }
    const handleDelete = (convId) => {
        console.log("Deleting Conversation " + convId)

        dispatch(removeConversation({ id: convId }))
    }
    const handleLeave = (convId) => {
        console.log("Leaving Conversation " + convId)
    }
    if(Array.isArray(conversations) && conversations.length > 1){
        conversations = conversations.filter((value, index, self) => {
            return self.indexOf(value) === index;
        })
    }
    function getDisplay(){
        if(sidebar && showConvList){ //Full screen sidebar with narrow screen
            return ""
        } else if(!sidebar) { //Partial screen sidebar with wide screen
            return ""
        } else {
            return "none"
        }   
    }
    function getPaper(){
        if(sidebar && showConvList){
            return classes.fullDrawerPaper
        } else if(!sidebar && !showConvList) {
            return classes.drawerPaper
        } else {
            return classes.hidePaper
        }  
    }
    return (
        <Drawer
            variant="permanent"
            classes={{
                paper: getPaper()
            }}
            style={{ display: getDisplay() }}
        >
            <Toolbar />
            <div className={classes.drawerContainer}>
                <List style={{ opacity: 0.8 }}>
                    {conversations.map((el) => {
                        if(el.pending === true){
                            return ""
                        }
                        const id = el.id;
                        return (<ListItem style={{ borderBottom: "2px solid #505050"}} className={classes.listItem} selected={false} button key={`text + ${Math.random()}`}>
                            <Container onClick={() => cl(el)} fluid style={{ minWidth: "195px" }}>
                                <Row className="pb-4 mt-3" style={{ minWidth: "210px" }}>
                                    <Col lg="12" style={{ minWidth: "200px" }}>
                                        <Container fluid style={{ minWidth: "200" }}>
                                        <Row className="font-weight-bold text-primary">
                                            <h5>{el ? el.conversationName : ""}</h5>
                                        </Row>
                                        <Row className="w-100" style={{ fontSize: "0.8rem"}}>
                                            <div className="ml-1 d-block text-truncate">
                                                {(el && el.messages && el.messages[0]) ? el.messages[0].body : ""}                  
                                            </div>
                                        </Row>
                                        <Row className="lead w-100 mt-3" style={{ marginBottom: "-15px", fontSize: "0.65rem"}}>
                                            <div className="ml-1 d-block text-truncate font-italic">
                                                {el ? new Date(Date.parse(el.createdAt)).toLocaleString('en-US'): ""}   
                                            </div>
                                        </Row>
                                        </Container>
                                    </Col>       
                                </Row>
                            </Container>
                            <SelectableContext.Provider value={false}>
                                <Container style={{ maxWidth: "50px" }} fluid>
                                    <Dropdown style={{ backgroundColor: "#404040", position: "relative", zIndex: "10"}}>              
                                        <Dropdown.Toggle className="dropdown-toggle text-white" style={{ border:" none", backgroundColor: "#222222"}} as="button" id="dropdown-custom-2"><MoreVertIcon></MoreVertIcon></Dropdown.Toggle>
                                        <Dropdown.Menu style={{ backgroundColor: "#404040"} } className="my-dropdown text-white">
                                            <Dropdown.Item  className="text-white" style={{ backgroundColor: "#404040"}} as="button" onClick={ () => handleDelete(id) } >Delete</Dropdown.Item>
                                            <Dropdown.Item  className="text-white" style={{ backgroundColor: "#404040"}} as="button" onClick={ () => handleLeave(id) } >Leave</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Container>
                            </SelectableContext.Provider>
                        </ListItem>)})
                    }
                </List>
            </div>
        </Drawer>
    )
}