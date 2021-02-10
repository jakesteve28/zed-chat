import React, { Fragment } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import './settings-modal.css';
import { Typography } from '@material-ui/core';

export default function About() {
    return (
        <div className="settings-modal">
            <Container fluid>
                <Row>
                    <Col className="mx-auto text-center pt-1 pb-3">
                        <h5 className="text-danger">About Project Zed</h5>
                    </Col>
                </Row>
                <Row className="pt-2 pb-2">
                    <Col className="mx-auto text-center text-white" xs="12">
                    <Typography>
                            Blah blah blah this is my open source version of realtime e2e encrypted messaging.
                            Email me at jakestevens081@gmail.com for questions. 
                            www.github.com/jakesteve28
                    </Typography>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}