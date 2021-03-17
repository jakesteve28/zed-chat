import React from 'react'; 
import { Container } from 'react-bootstrap'; 
import BannerPage from '../components/banner/BannerPage';
export default function Info(){ 
    return (
      <div className="w-100 h-100">
        <Container fluid className="w-100 h-100">
          <BannerPage></BannerPage>
        </Container>
      </div>
    )
  }   