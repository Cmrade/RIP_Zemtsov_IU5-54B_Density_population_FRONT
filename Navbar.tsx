import React, { useState } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MyNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [populationsIconError, setPopulationsIconError] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const populationsIconSrc = populationsIconError 
    ? '/default-image.jpg' 
    : 'http://localhost:9000/static/img/orders.png';

  return (
    <>
      <div className="app-header d-none d-md-flex">
        <div 
          className="app-header-main"
          onClick={() => handleNavigation('/')}
        >
          ЧИСЛЕННОСТЬ
        </div>
        <div className="app-header-dot">.РФ</div>
        <div className="app-header-dop d-none d-lg-block">
          главный вычислительный портал страны
        </div>
        
        <div 
          className="nav-service-top"
          onClick={() => handleNavigation('/populations')}
        >
          <img 
            src={populationsIconSrc}
            alt="Услуги"
            style={{ width: '24px', height: '24px', marginRight: '8px' }}
            onError={() => setPopulationsIconError(true)}
          />
          <span>Услуги</span>
        </div>
      </div>

      <BootstrapNavbar bg="dark" variant="dark" expand="md" fixed="top" className="d-md-none">
        <Container>
          <BootstrapNavbar.Brand onClick={() => handleNavigation('/')} style={{ cursor: 'pointer' }}>
            <span style={{ color: 'white' }}>ЧИСЛЕННОСТЬ</span>
            <span style={{ color: 'rgb(187, 65, 15)' }}>.РФ</span>
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => handleNavigation('/')}>Главная</Nav.Link>
              <Nav.Link onClick={() => handleNavigation('/populations')}>
                <img 
                  src={populationsIconSrc}
                  alt="Услуги"
                  style={{ width: '20px', height: '20px', marginRight: '5px' }}
                  onError={() => setPopulationsIconError(true)}
                />
                Услуги
              </Nav.Link>
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
    </>
  );
};

export default MyNavbar;