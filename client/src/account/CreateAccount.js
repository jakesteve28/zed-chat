import React, { useState } from 'react'
import { Button, InputGroup, FormControl, Container, Row, Col } from 'react-bootstrap'
import './createaccount.css'
import { Redirect } from 'react-router-dom'

function CreateAccount(){
    const [fName, setFName] = useState("")
    const [lName, setLName] = useState("")
    const [tagName, setTagName] = useState("")
    const [email, setEmail] = useState("")
    const [pw1, setPW1] = useState("")
    const [pw2, setPW2] = useState("")
    const [backToLogin, setBackToLogin] = useState(false)

    const submit = async () => {
        console.log(fName, lName, tagName, email, pw1, pw2)
        const bd = {
            firstName: fName,
            lastName: lName,
            email: email,
            password: pw1,
            session: 0,
            tagName: tagName
        }
        const res = await fetch("http://localhost:3002/api/users/", {
            method: "POST",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(bd)
        })
        const body = await res.json()
        console.log(body)
        setBackToLogin(true)
    }

    return (
        (!backToLogin) ? 
        <Container className="w-100 h-100" fluid  style={{backgroundColor: "#191919",  margin: "auto"}}>
        <Row className="mt-5 text-white">
            <Col className="text-center mt-5" style={{ opacity: 0.87}}><h2>Enter Account Information</h2></Col>
        </Row>
        <Row className="pt-5 text-white lead" style={{ backgroundColor: "#191919", marginBottom: "-10px" }}>
        <InputGroup className="mb-5 ml-2 mr-2 pl-3 pr-3">
            <FormControl
                style={{color: "white", minHeight: '50px', backgroundColor: "#404040", border: 'none', }}
                placeholder="First Name"
                aria-label="First Name"
                aria-describedby="basic-addon1"
                onChange={ (e) => setFName(e.target.value) }
            />
        </InputGroup>
        <InputGroup className="mb-5 ml-2 mr-2 pl-3 pr-3">
            <FormControl
                style={{color: "white", minHeight: '50px', backgroundColor: "#404040", border: 'none', }}
                placeholder="Last Name"
                aria-label="Last Name"
                aria-describedby="basic-addon1"
                onChange={ (e) => setLName(e.target.value) }
            />
        </InputGroup>
        <InputGroup className="mb-5 ml-2 mr-2 pl-3 pr-3">
            <FormControl
                style={{color: "white", minHeight: '50px', backgroundColor: "#404040", border: 'none', }}
                placeholder="Email Address"
                aria-label="Email Address"
                aria-describedby="basic-addon1"
                onChange={ (e) => setEmail(e.target.value) }
            />
        </InputGroup>
        <InputGroup className="mb-5 ml-2 mr-2 pl-3 pr-3">
        <InputGroup.Prepend>
            <InputGroup.Text style={{ color:"white", backgroundColor: "#404040", border: 'none' }} id="basic-addon1">@</InputGroup.Text>
        </InputGroup.Prepend>
            <FormControl
                style={{color: "white", minHeight: '50px', backgroundColor: "#404040", border: 'none', }}
                placeholder="Desired Tag Name"
                aria-label="Desired Tag Name"
                aria-describedby="basic-addon1"
                onChange={ (e) => setTagName(e.target.value) }
            />
        </InputGroup>
        <InputGroup className="mb-5 ml-2 mr-2 pl-3 pr-3">
        <FormControl
            style={{color: "white", minHeight: '50px', backgroundColor: "#404040", border: 'none', }}
            type="password"
            placeholder="Desired Password"
            aria-label="Desired Password"
            aria-describedby="basic-addon1"
            onChange={ (e) => setPW1(e.target.value) }
            />
        </InputGroup>
        <InputGroup className="mb-5 ml-2 mr-2 pl-3 pr-3">
        <FormControl
            style={{color: "white", minHeight: '50px', backgroundColor: "#404040", border: 'none', }}
            type="password"
            placeholder="Confirm Password"
            aria-label="Confirm Password"
            aria-describedby="basic-addon1"
            onChange={ (e) => setPW2(e.target.value) }
            />
        </InputGroup>
        </Row>
        <Row style={{backgroundColor: "#191919"}}>
        <Container fluid>
            <Row>
            <Col lg className="text-right p-5">
                <Button onClick={submit} size="lg" className="rounded-pill" variant="outline-danger">Clear</Button>
                &nbsp; &nbsp;
                <Button onClick={submit} size="lg" className="rounded-pill" variant="outline-primary">Submit</Button>
            </Col>
            </Row>
        </Container>
        </Row>
        </Container> : <Redirect to="/login"></Redirect>
    );
}
export default CreateAccount;