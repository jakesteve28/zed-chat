import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import './settings-modal.css';
import { Typography } from '@material-ui/core';

export default function PrivacySecurityDisclaimer() {
    return (
        <div className="settings-modal">
            <Container fluid>
                <Row>
                    <Col className="mx-auto text-center pt-1 pb-3">
                        <h5>Privacy and Security Disclaimers</h5>
                    </Col>
                </Row>
                <Row className="pt-2 pb-2">
                    <Col className="mx-auto text-center text-white" xs="12">
                    <Typography>
                            Blah blah blah TODO 
                    </Typography>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}