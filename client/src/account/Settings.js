import React from 'react'
import {  Container, Row, Col } from 'react-bootstrap'
import {
    selectAccount
} from './accountSettingsSlice'
import { useSelector } from 'react-redux'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom'

export default function Settings(){
    const account = useSelector(selectAccount)
    return (
        <Container className="h-100 w-100" fluid  style={{ backgroundColor: "#191919",  margin: "auto"}}>
        <Row className="mt-5">
        <Col xs="3">
        </Col>
        <Col xs="1" className="text-left mt-5"><h2 className="text-white" style={{ opacity: 0.87 }}><Link to="/home" as="button" className="text-white dropdown-toggle mr-2 rounded" style={{ marginRight: "50px", border: "none", outline: "none", backgroundColor: "#191919" }}><ArrowBackIcon></ArrowBackIcon></Link></h2>
        </Col>
       
        <Col className="text-left mt-5">
            <h2 className="text-white" style={{ opacity: 0.87 }}>Account Settings</h2>
        </Col>
        <Col xs="2">
        </Col>
        </Row>  
        <Row>
            <Col xs="4"></Col>
            <Col xs='2'  className="lead p-2 text-left text-white" style={{ opacity: 0.87 }}>
                Email:
            </Col>
            <Col xs='6'  className="lead p-2 text-left text-white" style={{ opacity: 0.87 }}>
             {account.email}
            </Col>
            <Col></Col>
        </Row>
        
        <Row>
            <Col xs="4"></Col>
            <Col xs='2'  className="lead p-2 text-left text-white" style={{ opacity: 0.87 }}>
                Tag Name:
            </Col>
            <Col xs='6'  className="lead p-2 text-left text-white" style={{ opacity: 0.87 }}>
            {account.tagName}
            </Col>
            <Col></Col>
        </Row>
        </Container>
      )   
}
