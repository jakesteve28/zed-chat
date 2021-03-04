import React, { useEffect, useState } from 'react';
import {  Container, Row, Col, Button } from 'react-bootstrap';
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
import './settings.css';
export default function Settings(){
    const account = useSelector(selectAccount);
    const dispatch = useDispatch();
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
        dispatch(setTopbarMessage(`Account Settings`));
    }, []);
    return (
        <Container className="h-100 w-100 account-settings-container" fluid>
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
                <Col className="mx-auto p-5 account-settings-button-column" xs="8">
                    <Container fluid className="account-settings-button-container mt-3">       
                        <Row className="mb-2">
                            <Col className="pb-4 text-left lead mx-auto border-bottom border-dark account-settings-title-col">
                                <span className="mx-auto account-title-span">Your Account</span>
                            </Col>           
                        </Row>  
                        <Row className="mb-2 mt-1">
                            <Col className="p-2 text-left account-settings-email-col">
                                <span className="mx-auto account-title-span"><span className="text-muted">Email:</span>&nbsp;&nbsp;&nbsp;{account.email}</span>
                            </Col>
                        </Row>
                        <Row className="pt-2 account-button-row">
                            <Col>
                                <Button onClick={() => resetPassword()} className="p-3 m-2 account-button text-success" variant="dark"> <LockIcon className="settings-screen-button"></LockIcon> Reset Password</Button>
                                <Button onClick={() => changeTagname()} className="p-3 m-2 account-button text-info" variant="dark"><TransferWithinAStationIcon className="settings-screen-button"></TransferWithinAStationIcon> Change Tagname</Button>
                                <Button onClick={() => deleteAccount()} className="p-3 m-2 account-button text-danger" variant="dark"><DeleteForeverIcon className="settings-screen-button"></DeleteForeverIcon> Delete Account</Button>
                                <Button onClick={() => aboutPage()} className="p-3 m-2 account-button text-primary" variant="dark"><InfoIcon className="settings-screen-button"></InfoIcon> About</Button>
                                <Button onClick={() => privacyDisclaimer()} className="p-3 m-2 account-button text-warning" variant="dark"><SecurityIcon className="settings-screen-button"></SecurityIcon> Privacy/Security Disclaimer</Button>
                            </Col> 
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
      )   
}
