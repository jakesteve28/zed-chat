import React, { useEffect, useState } from 'react';
import {  Container, Row, Col, Button } from 'react-bootstrap';
import SettingsIcon from '@material-ui/icons/Settings';
import useWindowSize from '../../util/windowSize';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import TransferWithinAStationIcon from '@material-ui/icons/TransferWithinAStation';
import LockIcon from '@material-ui/icons/Lock';
import InfoIcon from '@material-ui/icons/Info';
import SecurityIcon from '@material-ui/icons/Security';
import About from '../modals/About';
import ChangeTagname from '../modals/ChangeTagname';
import DeleteAccount from '../modals/DeleteAccount';
import PrivacySecurityDisclaimer from '../modals/Privacy.Security.Disclaimer';
import ResetPW from '../modals/ResetPW';
import { Modal } from '@material-ui/core';
import {
    selectAccount,
    logout,
    clearAccount
} from '../../store/slices/accountSettingsSlice';
import { clearAuth } from '../../store/slices/authSlice';
import { clearConversations } from '../../store/slices/conversationsSlice';
import { clearInvites } from '../../store/slices/inviteSlice';
import { clearFriends } from '../../store/slices/friendsSlice';
import { useSelector, useDispatch } from 'react-redux';
import { setTopbarMessage } from '../../store/slices/uiSlice';

export default function Settings(){
    const account = useSelector(selectAccount);
    const dispatch = useDispatch();
    const size = useWindowSize();
    const wide = size.width > 768;
    const [aboutOpened, setAboutOpened] = useState(false);
    const [deleteAccOpened, setDeleteAccOpened] = useState(false);
    const [privacyOpened, setPrivacyOpened] = useState(false);
    const [resetPWOpened, setResetPWOpened] = useState(false);
    const [changeTagnameOpened, setChangeTagnameOpened] = useState(false);

    const logoutAccount = async () => {
        await fetch("http://localhost:3000/api/auth/logout", {
            credentials: "include"
        });
        dispatch(logout());
        dispatch(clearAccount());
        dispatch(clearAuth());
        dispatch(clearConversations());
        dispatch(clearInvites());
        dispatch(clearFriends());
        console.log("Successfully logged out");
    }

    const resetPassword = () => {
        setResetPWOpened(true);
    }

    const changeTagname = () => {
        setChangeTagnameOpened(true);
    }

    const deleteAccount = () => {
        setDeleteAccOpened(true);
    }

    const aboutPage = () => {
        setAboutOpened(true);
    }

    const privacyDisclaimer = () => {
        setPrivacyOpened(true);
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
            <Row className="pt-3">
                <Modal
                    open={aboutOpened}
                    onClose={() => setAboutOpened(false)}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <About></About>
                </Modal>
                <Modal
                    open={changeTagnameOpened}
                    onClose={() => setChangeTagnameOpened(false)}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <ChangeTagname logoutAccount={logoutAccount}></ChangeTagname>
                </Modal>
                <Modal
                    open={deleteAccOpened}
                    onClose={() => setDeleteAccOpened(false)}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <DeleteAccount logoutAccount={logoutAccount}></DeleteAccount>
                </Modal>
                <Modal
                    open={privacyOpened}
                    onClose={() => setPrivacyOpened(false)}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <PrivacySecurityDisclaimer></PrivacySecurityDisclaimer>
                </Modal>
                <Modal
                    open={resetPWOpened}
                    onClose={() => setResetPWOpened(false)}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <ResetPW logoutAccount={logoutAccount}></ResetPW>
                </Modal>
            </Row>
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
                    </Container>
                </Col>
            </Row>
        </Container>
      )   
}
