import React, { useState } from 'react';
import './App.css';
import './index.css'
import LoginScreen from './login/loginScreen'
import CreateAccount from './account/CreateAccount';
import { Container } from 'react-bootstrap';
import 'react-pro-sidebar/dist/css/styles.css';
import TopBar from './topbar/TopBar.js';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Sidebar from './sidebar/Sidebar';
import CurrentConversationContainer from './currentConversation/CurrentConversationContainer';
import ForgotPassword from './account/ForgotPassword';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  selectAccount
} from './account/accountSettingsSlice'
import GuardedRoute from './login/loginGuard'
import Settings from './account/Settings'
import NotificationSocket from './socket/notificationSocket'
import ChatSocket from './socket/chatSocket';
import { useTransition, animated, config } from 'react-spring'
import { selectShowConvList } from './currentConversation/conversationsSlice'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useWindowSize from './sidebar/windowSize';
import NewConversation from './newConversation/NewConversation';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#191919",
    height: "100%",
    minHeight: "100%"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(0),
    marginLeft: "20px",
    backgroundColor: "#191919",
    height: "100%",
  },
  contentConv: {
    display: 'flex',
    flexDirection: "column",
    height: "90%"
  },
  menuButton: {
    marginRight: theme.spacing(3),
  },
  title: {
    flexGrow: 1,
  },
  '@global': {
    '::-webkit-scrollbar': {
      width: '1.2em'
    },
    '::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 15px rgba(0,0,0,0.0)',
      borderRadius: '10px',
      backgroundColor: 'rgba(0,0,0,.1)',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(125,125,125,.1)',
      borderRadius: '10px',
      height: '30px',
      maxHeight: '30px'
    },
    '::-webkit-scrollbar-track-piece': {
      height: '30px'
  }
  }
}));

function Login(){
    return (
      <Container className="w-100 h-100" 
        style={{ 
          backgroundImage: `url("https://oregonwild.org/sites/default/files/featured-imgs/MtHood.JohnEklund.jpg")`, 
          margin: "auto",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundColor: "#191919"
        }} 
        fluid 
        >
        <CssBaseline />
        <TopBar></TopBar>
        <LoginScreen></LoginScreen>
      </Container>
  )
}

function Fgpw(){
  return (
      <Container className="w-100 h-100" 
        style={{ 
          backgroundImage: `url("https://oregonwild.org/sites/default/files/featured-imgs/MtHood.JohnEklund.jpg")`, 
          margin: "auto",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundColor: "#191919"
        }} 
        fluid 
        >
        <CssBaseline />
        <TopBar></TopBar>
        <ForgotPassword></ForgotPassword>
      </Container>
  )
}

function CreateAcc(){
  return (
      <Container className="w-100 h-100" 
        style={{ 
          backgroundImage: `url("https://oregonwild.org/sites/default/files/featured-imgs/MtHood.JohnEklund.jpg")`, 
          margin: "auto",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundColor: "#191919"
        }} 
        fluid 
        >
        <CssBaseline />
        <TopBar></TopBar>
        <CreateAccount></CreateAccount>
      </Container>
  )
}

function Home(){ 
  const showConvList = useSelector(selectShowConvList)
  const size = useWindowSize();
  return (
    <div className="w-100 h-100" style={{ backgroundColor: "#191919 "}}>
      <NotificationSocket></NotificationSocket>
      <ChatSocket></ChatSocket>
      <Container fluid className="w-100 h-100" style={{ 
        backgroundImage: `url("https://oregonwild.org/sites/default/files/featured-imgs/MtHood.JohnEklund.jpg")`, 
        margin: "auto",
        backgroundPosition: "center right",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover"
      }} 
      >
        <CssBaseline />
        <TopBar></TopBar>
        { (showConvList) ? (<Sidebar></Sidebar>) :
          (
            <>
              <Sidebar></Sidebar>
              <Container fluid className="w-100">
              
                <CurrentConversationContainer className="w-100" ></CurrentConversationContainer>
              </Container>
            </>
        )}
      </Container>
    </div>
    )
}   

function NewConv(){
  const size = useWindowSize();
  return (
    <div className="w-100 h-100">
      <NotificationSocket></NotificationSocket>
      <ChatSocket></ChatSocket>
      <CssBaseline />
        <TopBar></TopBar>
        <Sidebar></Sidebar>
        <Container fluid className="w-100 h-100" style={{ 
            backgroundImage: `url("https://oregonwild.org/sites/default/files/featured-imgs/MtHood.JohnEklund.jpg")`, 
            margin: "auto",
            backgroundPosition: "center right",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            paddingTop: "100px"
          }} >
          <NewConversation></NewConversation>
        </Container>
    </div>
    )
}

function SettingScr(){
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar></TopBar>
      <Sidebar></Sidebar>
      <main className={classes.content}>
          <Settings></Settings>
      </main>
    </div>
    )
}

function Main(){
  const auth = useSelector(selectAccount)
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login}></Route>
        <Route path="/forgotPassword" component={Fgpw}></Route>
        <Route path="/createAccount" component={CreateAcc}></Route>
        <GuardedRoute path="/home" component={Home} auth={auth.loggedIn}></GuardedRoute>
        <GuardedRoute path="/settings" component={SettingScr} auth={auth.loggedIn}></GuardedRoute>
        <GuardedRoute path="/newConversation" component={NewConv} auth={auth.loggedIn}></GuardedRoute>
        <GuardedRoute path="/" component={Home} auth={auth.loggedIn}></GuardedRoute>
      </Switch>
  </Router>
  )
}


const pages = [
  { displayName:"MainPage", id: 0, jsx: ({ style }) => (<Main></Main>) }
]

function App() {
  const [index, set] = useState(0)
  const transitions = useTransition(pages[index], item => item.id, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.stiff,
  })
  const classes = useStyles();
  return transitions.map(({ item, props, key }) => (
    <animated.div key={key} className="bg" style={{backgroundColor: "#191919"}}>
    <ToastContainer toastClassName="bg-gray-600" />
      { item.jsx({ style: { ...props, height: "100%", backgroundColor: "#191919" }, className: classes.root }) }
    </animated.div>
  ))
}

export default App;