import React, { useEffect, useState } from 'react'
import { Button, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import './topbar.css'
import useWindowSize from '../sidebar/windowSize';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useLocation } from 'react-router-dom'
import ForumIcon from '@material-ui/icons/Forum';
import {
  selectAccount,
} from '../account/accountSettingsSlice'
import {
  selectCurrentConversation,
  selectView,
  selectShowConvList,
  setShowConvList
} from '../currentConversation/conversationsSlice'
import { useDispatch, useSelector } from 'react-redux'
import { SettingsDropdown, NotificationsDropdown, FriendsDropdown } from './Dropdowns';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexGrow: 1,
      backgroundColor: "#191919",
      height: "100%"
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      backgroundColor:"#191919"
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    menu : {
      backgroundColor: "#404040"
    }
}));

function StartChatButton(){
  return (
    <div>
      <Link id="accountSettings" style={{ display: "none" }} to="/newConversation"></Link>
      <Button onClick={async () => { document.getElementById("accountSettings").click(); }} variant="primary" className="rounded-pill mx-auto my-form-control-button" style={{ opacity: 0.75, boxShadow: "black 5px 5px " }}>
        <ForumIcon></ForumIcon> Start chat
      </Button>
    </div>
  )
}

export default function TopBar(){
    const size = useWindowSize()
    const classes = useStyles();
    const account = useSelector(selectAccount);
    const dispatch = useDispatch();
    const screenSmall = size.width < 768;
    const currentConversation = useSelector(selectCurrentConversation);
    const view = useSelector(selectView);
    const showConv = useSelector(selectShowConvList);
    const location = useLocation();
    const [bannerMessage, setBannerMessage] = useState("");

    useEffect(() => {
      setBannerMessage("");
    }, [view])

    return (
        <CssBaseline>
        <AppBar position="fixed"  className={classes.appBar}>
            <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            </IconButton>
            <Typography component={'span'} className={classes.title}>
               <Container fluid>
                  <Row className="text-center">
                    {
                    (account.loggedIn && !screenSmall) ? 
                          (
                            <>
                              <StartChatButton></StartChatButton>
                              <NotificationsDropdown></NotificationsDropdown>
                              <FriendsDropdown></FriendsDropdown>                   
                          </>
                       )
                      : ""
                    }
                    {
                        (account.loggedIn && screenSmall && !showConv) ?
                          (
                            <Button style={{backgroundColor: "#191919", border: "none"}} onClick={ () => {  dispatch(setShowConvList(!showConv)) }}><ArrowBackIcon></ArrowBackIcon></Button>
                          )
                        : ""
                    }        
                  </Row>
               </Container>
            </Typography>
            <Typography component={'span'} variant="h4" className={classes.title}>
                <span style={{ opacity: 0.67 }} className="text-white lead">{bannerMessage}</span>
            </Typography>
            {
              (account.loggedIn === false && location.pathname !== "/login") ? (<Link className="rounded-pill btn btn-outline-primary mr-5 rounded-pill" style={{ opacity: 0.67 }} renderas={Button} to="/login">
              Login
            </Link>) : ""
            }
            {(account.loggedIn) ? (
              <SettingsDropdown></SettingsDropdown>
            ) : ""}
            </Toolbar>
        </AppBar>
        </CssBaseline>
    )
}