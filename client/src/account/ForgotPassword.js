import React, { useState } from 'react'
import {  Button, InputGroup, FormControl, Container, Row, Col } from 'react-bootstrap'

function ForgotPassword(){
    const [email, setEmail] = useState("")
    const [tagname, setTagname] = useState("")
    const submit = () => {
        console.log(email, tagname)
    }
    return (
        <Container className="h-100 w-100" fluid  style={{ backgroundColor: "#191919",  margin: "auto"}}>
        <Row className="mt-5"><Col className="text-center mt-5"><h2 className="text-white" style={{ opacity: 0.87 }}>Forgotten Password</h2></Col></Row>  
        <Row className="p-3 text-white lead" style={{ backgroundColor: "#191919" }}>
          <InputGroup className="mb-5 ml-2 mr-2 pl-3 pr-3 mt-5 rounded-pill text-white lead">
            <InputGroup.Prepend >
              <InputGroup.Text style={{ color:"white", backgroundColor: "#404040", border: 'none' }} id="basic-addon1">@</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              style={{color: "white", minHeight: '50px', backgroundColor: "#404040", border: 'none', }}
              placeholder="Enter Your TagName"
              aria-label="Enter Your TagName"
              aria-describedby="basic-addon1"
              onChange={ e => { setTagname(e.target.value) }  }
            />
          </InputGroup>
          <InputGroup className="mb-5 ml-2 mr-2 pl-3 pr-3">
            <FormControl
              style={{color: "white", minHeight: '50px', backgroundColor: "#404040", border: 'none', }}
              placeholder="Enter Your Email"
              aria-label="Enter Your Email"
              aria-describedby="basic-addon1"
              onChange={ e => setEmail(e.target.value) }
            />
          </InputGroup>
          </Row>
          <Row>
          <Container fluid>
            <Row className="p-2" style={{backgroundColor: "#191919"}}>
              <Col className="text-center mr-5 mb-2">
                <Button onClick={submit} size="lg" className="rounded-pill" variant="outline-success">Send Link to Reset Password</Button>
              </Col>
            </Row>
          </Container>
          </Row>
        </Container>
      );
        
}
export default ForgotPassword;