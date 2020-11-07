import React from 'react';
import { ListItem } from '@material-ui/core'
import { Container, Row, Col, Spinner } from 'react-bootstrap'

export function typing(){
    return (
        <ListItem>
        <Container fluid>
            <Row>
                <Col xs="2" className="rounded p-2 text-black text-sm lead" style={{minWidth: "100px", maxWidth: "100px", backgroundColor: "#5cb85c", textAlign: "center" }}>
                <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    variant=""
                    className="m-1"
                /> 
                <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    variant=""
                    className="m-1"
                    />
                <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    variant=""
                    className="m-1"
                />
                </Col>
            </Row>
        </Container>
    </ListItem>
    )
};