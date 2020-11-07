import React, { useState } from 'react'
import {  Button, Container, Row, Col } from 'react-bootstrap'
import {
    selectAccount
} from './accountSettingsSlice'
import { useSelector } from 'react-redux'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom'
import AddIcon from '@material-ui/icons/Add'

export default function Contacts(){
    const [contacts, setContacts] = useState([])
    const submit = () => {
        
    }
    const account = useSelector(selectAccount)
    return (
        <Container className="h-100 w-100" fluid  style={{ backgroundColor: "#191919",  margin: "auto"}}>
        <Row className="mt-5">
        <Col xs="1" className="text-left mt-5"><h2 className="text-white" style={{ opacity: 0.87 }}><Link to="/home" as="button" className="text-white dropdown-toggle mr-2 rounded" style={{ marginRight: "50px", border: "none", outline: "none", backgroundColor: "#191919" }}><ArrowBackIcon></ArrowBackIcon></Link></h2>
        </Col>
        <Col className="text-center mt-5">
            <h2 className="text-white" style={{ opacity: 0.87 }}>Contacts</h2>
        </Col>
        <Col xs="2">
        </Col>
        </Row>
        {
            ["justin", "joey", "jacob"].map((text) => {
                return (
                    <Row>
                    <Col xs="4" ></Col>
                    <Col xs='1'  className="lead p-2 text-center text-white" style={{ opacity: 0.87 }}>
                        <Button style={{ border: "none", outline: "none", backgroundColor: "#191919" }}><AddIcon></AddIcon></Button>
                    </Col>
                    <Col xs='6'  className="lead p-2 text-left text-primary" style={{ opacity: 0.87 }}>
                        {`@${text}`}
                    </Col>
                    <Col xs="2"></Col>
                </Row>
                )
            })
        }  
        </Container>
      )   
}
