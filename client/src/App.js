import React, { useState, useEffect } from 'react';
import './App.css';
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
import Splash from './splash/Splash'
import { useTransition, animated, config } from 'react-spring'
import { selectShowConvList } from './currentConversation/conversationsSlice'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#191919",
    height: "100%"
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
    height: "90%",
    overflow: "auto"
  },
  menuButton: {
    marginRight: theme.spacing(3),
  },
  title: {
    flexGrow: 1,
  },
  '@global': {
    '*::-webkit-scrollbar': {
      width: '1.2em'
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 15px rgba(0,0,0,0.0)',
      borderRadius: '10px',
      backgroundColor: 'rgba(0,0,0,.1)',
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(125,125,125,.1)',
      borderRadius: '10px',
      height: '30px',
      maxHeight: '30px'
    },
    '*::-webkit-scrollbar-track-piece': {
      height: '30px'
  }
  }
}));

function Login(){
  const classes = useStyles();
  const notify = () => toast.info("Hello!\r\n This application uses cookies to authenticate you with the server.", { position: "top-center", hideProgressBar: true, pauseOnHover: true} );
  useEffect(() => { notify(); } , [] );
  return (<div className={classes.root} style={{ animation: `fadeIn 1.8s` }}>

  <CssBaseline />
  <TopBar></TopBar>
    <main className={classes.content}>
        <LoginScreen></LoginScreen>
    </main>
  </div>)
}

function Fgpw(){
  const classes = useStyles();
  return(<div className={classes.root}>
  <CssBaseline />
  <TopBar></TopBar>
  <main className={classes.content}>
      <ForgotPassword></ForgotPassword>
  </main></div>
  )
}

function CreateAcc(){
  const classes = useStyles();
  return (
    <div className={classes.root}>
    <CssBaseline />
    <TopBar></TopBar>
    <main className={classes.content}>
        <CreateAccount></CreateAccount>
    </main></div>
  )
}

function Home(){
  const showConvList = useSelector(selectShowConvList)

  return (
    <div>
      <NotificationSocket></NotificationSocket>
      <ChatSocket></ChatSocket>
      <Container fluid className="w-100 view-height">
      <CssBaseline />
        <TopBar></TopBar>
        { (showConvList) ? (<Sidebar></Sidebar>) :
          (
            <>
              <Sidebar></Sidebar>
              <Container fluid className="w-100 view-height">
              
                <CurrentConversationContainer className="w-100 view-height" ></CurrentConversationContainer>
              </Container>
            </>
         )}
        <Container fluid className="w-100 view-height">
            <CurrentConversationContainer></CurrentConversationContainer>
        </Container>
      </Container>
    </div>
    )
}

function Conversations(){
  const classes = useStyles();
  return (
    <Container fluid className={classes.root}>
      <CssBaseline />
      <TopBar></TopBar>
      <Sidebar></Sidebar>
      <Container fluid className="w-100">
          <CurrentConversationContainer></CurrentConversationContainer>
      </Container>
    </Container>
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
        <GuardedRoute path="/conversations" component={Conversations} auth={auth.loggedIn}></GuardedRoute>
        <GuardedRoute path="/settings" component={SettingScr} auth={auth.loggedIn}></GuardedRoute>
        <GuardedRoute path="/" component={Home} auth={auth.loggedIn}></GuardedRoute>
      </Switch>
  </Router>
  )
}


const pages = [
  { id: 0, jsx: ({ style }) => <Splash></Splash> },
  { id: 1, jsx: ({ style }) => <Main></Main> }
]


function App() {
  const [index, set] = useState(0)
  const transitions = useTransition(pages[index], item => item.id, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.stiff,
  })
  useEffect(() => setTimeout(() => set(state => state += 1), 1000), [])
  return transitions.map(({ item, props, key }) => (
    <animated.div key={key} className="bg">
    <ToastContainer toastClassName="bg-gray-600" />
      { item.jsx({ style: { ...props, height: "100%" }}) }
    </animated.div>
  ))
}

export default App;