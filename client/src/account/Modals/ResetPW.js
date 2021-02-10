import React, { Fragment, useRef } from 'react';
import { Row, Col, Container, InputGroup, FormControl, Button } from 'react-bootstrap';
import './settings-modal.css';
import { Typography } from '@material-ui/core';

export default function ResetPW({ logoutAccount }) {
    const submit = () => {
        alert("You're going to be logged out now...");
        logoutAccount();
    }
    return (
        <div className="settings-modal">
            <Container fluid>
                <Row>
                    <Col className="mx-auto text-center pt-1 pb-3">
                        <h5>Reset Password</h5>
                    </Col>
                </Row>
                <Row>
                    <Col className="mx-auto text-center pt-1 pb-3">
                        <Typography className="text-warning">Note that this action will log and lock you out, and then send a reset link to your account's listed email.</Typography>
                    </Col>
                </Row>
                <Row className="pt-2 mt-5">
                    <Col className="text-center">
                        <Button onClick={() => submit()} variant="outline-danger" size="lg">Reset Password</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}