import React, { useEffect, useState, useRef } from 'react'
import {  Container, Row, Col, Button, FormControl, InputGroup } from 'react-bootstrap'
import {
    selectAccount
} from './accountSettingsSlice'
import { useSelector, useDispatch } from 'react-redux'
import { setTopbarMessage } from '../uiSlice';
import SettingsIcon from '@material-ui/icons/Settings';
import useWindowSize from '../sidebar/windowSize';
import { notificationSocket } from '../socket/notificationSocket';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import TransferWithinAStationIcon from '@material-ui/icons/TransferWithinAStation';
import LockIcon from '@material-ui/icons/Lock';
import InfoIcon from '@material-ui/icons/Info';
import SecurityIcon from '@material-ui/icons/Security';
import './settings.css';

export default function Settings(){
    const account = useSelector(selectAccount);
    const dispatch = useDispatch();
    const size = useWindowSize();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [errorMsgs, setErrorMsgs] = useState([]);
    const [successMsg, setSuccessMsgs] = useState("");
    const [inputPlaceholder, setInputPlaceholder] = useState("")
    const inputRef = useRef(null);
    const wide = size.width > 768;
    const resetPassword = () => {
        //Pop a toast, logout in 3 seconds 
        //Handled in email to user
    }

    const changeTagname = () => {
        //Pop a toast, logout in 3 seconds
        //Handled in email to user
    }

    const deleteAccount = () => {
        //Pops open a "are you sure" modal with a description of what will happen
        //Recursively purges everything in database related to user's ID 
        //Pops a toast up when done, logs out, flags email and IP (cant recreate account)
    }

    const aboutPage = () => {
        //Navigate to about page in new tab 
        //(probably main marketing page)
    }

    const privacyDisclaimer = () => {
        //Pops up a modal with any legal crap about using the app and the
        //data I store
    }
    useEffect(() => {
        if(size.width > 768) {
            dispatch(setTopbarMessage((<span><SettingsIcon></SettingsIcon>&nbsp;Account Settings | @{account.tagName}</span>)));
        } else {
            dispatch(setTopbarMessage((<span><SettingsIcon></SettingsIcon> <span className="text-primary">@{account.tagName}</span></span>)));
        }
    }, [size.width]);
    return (
        <Container className="h-100 w-100" fluid  style={{ margin: "auto", paddingLeft: (wide) ?  "240px" : "0px" }}>
            <Row>
                <Col className="mx-auto p-5" xs="8" style={{ opacity: 0.8, borderRadius: "10px", backgroundColor: "#191919", maxWidth: "500px" }}>
                    <Container fluid>       
                        <Row className="mb-2">
                            <Col className="pb-4 text-center lead mx-auto border-bottom border-dark" xs="8" style={{ opacity: 0.87, color: "#EEEEEE", fontSize: "16pt"}}>
                                Your Account
                            </Col>           
                        </Row>  
                        <Row className="mb-2 mt-1">
                            <Col className="p-2 text-center" style={{ color: "#EEEEEE", opacity: 0.9, fontSize: "14pt" }}>
                                <span className="text-muted font-italic">Email:</span>&nbsp;&nbsp;&nbsp;{account.email} 
                            </Col>
                        </Row>
                        <Row className="p-2">
                            <Col className="text-center justify-content-around">
                                <Button onClick={() => resetPassword()} className="p-3 m-2 account-button" variant="dark" style={{ border: "none", backgroundColor: "#202020", padding: "15px", minWidth: "150px", maxWidth: "150px", minHeight: "125px", maxHeight: "125px" }} >Reset Password  <LockIcon></LockIcon></Button>
                                <Button onClick={() => changeTagname()} className="p-3 m-2 account-button" variant="dark" style={{ border: "none", backgroundColor: "#202020", padding: "15px", minWidth: "150px", maxWidth: "150px", minHeight: "125px", maxHeight: "125px" }} >Change Tagname <TransferWithinAStationIcon></TransferWithinAStationIcon></Button>
                                <Button onClick={() => aboutPage()} className="p-3 m-2 account-button" variant="dark" style={{ border: "none", backgroundColor: "#202020", padding: "15px", minWidth: "150px", maxWidth: "150px", minHeight: "125px", maxHeight: "125px" }} >About <InfoIcon></InfoIcon></Button>
                                <Button onClick={() => privacyDisclaimer()} className="p-3 m-2 account-button text-warning" variant="dark" style={{ border: "none", backgroundColor: "#202020", padding: "15px",  minWidth: "150px", maxWidth: "150px", minHeight: "125px", maxHeight: "125px" }} >Privacy / Security Disclaimer <SecurityIcon></SecurityIcon></Button>
                                <Button onClick={() => deleteAccount()} className="p-3 m-2 account-button text-danger" variant="dark" style={{ border: "none", backgroundColor: "#202020", padding: "15px", maxWidth: "150px", minHeight: "125px", maxHeight: "125px" }} >Delete Account <DeleteForeverIcon></DeleteForeverIcon></Button>
                            </Col> 
                        </Row>
                        <Row>
                            {
                                (success) ?
                                    <Col className="text-center text-success lead">
                                        {successMsg}
                                    </Col> : ""
                            }
                        </Row>
                        <Row>
                            {
                                (error) ?
                                <Col>
                                    <ul>
                                        {
                                            errorMsgs.map(msg => {
                                                return <li key={msg} className="text-center lead font-italic text-danger settings-error">{msg}</li>
                                            })
                                        }
                                    </ul>
                                </Col>
                                : ""
                            }
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
      )   
}
