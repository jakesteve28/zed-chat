import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import useWindowSize from '../sidebar/windowSize'
import {ReactComponent as ReactLogo } from '../logo.svg'

export default function Splash(){
    return (
        <Container fluid style={{ backgroundColor: "#191919" }}>
            <Row>
                <Col xs="2"></Col>
                <Col className="text-center lead font-weight-bolder" style={{ color: "#606060", opacity: 0.87, marginTop: 100 }}>
                   <ReactLogo />
                </Col>
                <Col xs="2"></Col>
            </Row>
        </Container>
    )
}