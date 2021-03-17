import React, { useState, useEffect } from 'react'; 
import { Container, Row, Col } from 'react-bootstrap'; 
import { useSelector, useDispatch } from 'react-redux'; 
import { useHistory } from 'react-router-dom'; 
import { selectBackground } from '../../store/slices/uiSlice';

export default function BannerPage() {
    const dispatch = useDispatch(); 
    const background = useSelector(selectBackground); 
    const history = useHistory();
    useEffect(() => {

    }, []); 
    const navigateLogin = () => {

    }
    const navigateSignup = () => {

    }
    return (
        <div>
            Banner page
        </div>
    );
}