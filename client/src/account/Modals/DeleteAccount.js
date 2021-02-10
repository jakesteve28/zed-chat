import React, { Fragment } from 'react';
import { Row, Col, Container, Button } from 'react-bootstrap';
import './settings-modal.css';
import { Typography } from '@material-ui/core';
import { DeleteForever } from '@material-ui/icons';
export default function DeleteAccount({ logoutAccount }) {
    const submit = () => {
        alert("You're going to be logged out now...");
        logoutAccount();
    }
    return (
        <div className="settings-modal">
            <Container fluid>
                <Row>
                    <Col className="mx-auto text-center pt-1 pb-3">
                        <h5>Delete Account</h5>
                    </Col>
                </Row>
                <Row>
                    <Col className="mx-auto text-center pt-1 pb-3"> 
                        <Typography className="text-warning">
                            Note that this action is PERMANENT. 
                            Once clicked, your encrypted account info, 
                            all encrypted messages, encrypted chats, 
                            and associated encrypted metadata will be killed. 
                            Your email's username and email will be flagged 
                            and not allowed for re-application. If more than 
                            three deletes come from your IP/user agent, 
                            your IP will be flagged and not allowed for re-application.
                            If your account is flagged, reported, or disabled for suspicious content, 
                            encrypted data will be warehoused as applicable by the law.
                        </Typography>
                    </Col>
                </Row>
                <Row className="pt-2 mt-2">
                    <Col className="text-center">
                        <Button onClick={() => submit()} variant="outline-danger" size="lg">DELETE ACCOUNT <DeleteForever></DeleteForever></Button>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}