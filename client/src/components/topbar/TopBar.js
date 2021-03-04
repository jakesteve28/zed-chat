import React from 'react';
import { Button, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Tooltip from '@material-ui/core/Tooltip';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import useWindowSize from '../../util/windowSize';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useLocation } from 'react-router-dom'
import ForumIcon from '@material-ui/icons/Forum';
import {
  selectAccount,
} from '../../store/slices/accountSettingsSlice';
import {
  selectView,
  selectShowConvList,
  setShowConvList,
  setView
} from '../../store/slices/conversationsSlice';
import SettingsDropdown from '../dropdowns/Settings';
import FriendsDropdown from '../dropdowns/Friends';
import NotificationsDropdown from '../dropdowns/Notifications';
import { selectTopbarMessage } from '../../store/slices/uiSlice';
import './topbar.css'

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexGrow: 1,
      backgroundColor: "#191919",
      height: "100%",
      opacity: 0.87
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
      color: "white"
    },
    menu : {
      backgroundColor: "#404040"
    }
}));

function StartChatButton(){
  const view = useSelector(selectView);
  const showConvList = useSelector(selectShowConvList);
  const dispatch = useDispatch()
  return (
    <div>
      <Link id="startChat" className="hidden-link" to="/newConversation"></Link>
      <Button onClick={async () => { 
          if(showConvList){
            dispatch(setShowConvList(false));
            //Hides the sidebar
          }
          if(view){
            dispatch(setView(false));
            //Sets the default view to false
          }
          document.getElementById("startChat").click(); 
        }} variant="primary" className="rounded-pill mx-auto my-form-control-button start-chat-button">
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
    const showConv = useSelector(selectShowConvList);
    const location = useLocation();
    const topbarMessage = useSelector(selectTopbarMessage);
    return (
        <CssBaseline>
        <AppBar position="fixed"  className={classes.appBar}>
            <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            </IconButton>
            <Typography component={'span'} className={classes.title}>
               <Container fluid>                   
                    {
                      (account.loggedIn) ? 
                          (
                            <Row>
                              {
                                (account.loggedIn && screenSmall && !showConv) ?
                                  (
                                    <Tooltip title="Show Chat Rooms">
                                      <Button className="back-button-topbar" onClick={ () => {  dispatch(setShowConvList(!showConv)) }}><ArrowBackIcon></ArrowBackIcon></Button>
                                    </Tooltip>
                                  )
                                : ""
                              }   
                              <StartChatButton></StartChatButton>
                              <NotificationsDropdown></NotificationsDropdown>
                              <FriendsDropdown></FriendsDropdown>              
                            </Row>
                          )
                      : ""
                    }
               </Container>
            </Typography>

            {
                (size.width > 768)
               ?
                <Typography component={'span'} variant="h4" className={classes.title}>
                    <span className="text-white lead topbar-text-span">{topbarMessage}</span>
                </Typography> 
                :  ""
            }
            
            
            {
              (account.loggedIn === false && location.pathname !== "/login") ? (<Link className="rounded-pill btn btn-outline-primary mr-5 rounded-pill topbar-text-span" renderas={Button} to="/login">
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