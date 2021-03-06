import React, { useEffect, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import useWindowSize from './windowSize'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Container, Row, Col } from 'react-bootstrap'
import "./sidebar.css"
import { useDispatch, useSelector } from 'react-redux';
import { selectConversations, selectCurrentConversation, setCurrentConversation } from '../currentConversation/conversationsSlice'
import { setView } from '../currentConversation/conversationsSlice'
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
    drawerContainer: {
      //overflow: 'ellipsis',
      backgroundColor: "#222222",
      color: "white"
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
    const sidebar = size.width < 768
    const conversations = useSelector(selectConversations)
    const currentConversation = useSelector(selectCurrentConversation)
    const [_convs, setConvs] = useState([])
    const dispatch = useDispatch()
    const cl = (el) => {
        if(!el.pending){
            console.log(el)
            dispatch(setView(false))
            dispatch(setCurrentConversation(el))
        } else {
            dispatch(setView(true))
        }
    }

    useEffect(() => {
        setConvs(conversations)
    }, [conversations])

    useEffect(() => {
        const clone = JSON.parse(JSON.stringify(conversations))
        const conversation = clone.filter(el => el.id === currentConversation.id)[0]
        if(conversation && Array.isArray(conversation.messages) && Array.isArray(currentConversation.messages) )
            conversation.messages = [...currentConversation.messages]
        setConvs(clone)
    }, [currentConversation])

    return (
        <Drawer
            className={sidebar ? classes.animate_out : classes.animate_out}
            variant="permanent"
            classes={{
            paper: classes.drawerPaper
            }}
            style={{ display: (sidebar ? "none" : "")}}
        >
            <Toolbar />
            <div className={classes.drawerContainer}>
                <List style={{ opacity: 0.8 }}>
                    {_convs.map((el) => {
                        if(el.pending){
                            return ""
                        }
                        return (<ListItem onClick={() => cl(el)} style={{ borderBottom: "2px solid #505050"}} className={classes.listItem} selected={false} button key={`text + ${Math.random()}`}>
                            <Container>
                                <Row className="pb-4 mt-3">
                                    <Col lg="12">
                                        <Container fluid>
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
                        </ListItem>)})
                    }
                </List>
            </div>
        </Drawer>
    )
}