import React, { useState } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';

const MyNavbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { currentDensityCalculation } = useAppSelector((state) => state.cart);
  const [populationsIconError, setPopulationsIconError] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const populationsIconSrc = populationsIconError 
    ? '/default-image.jpg' 
    : 'http://localhost:9000/static/img/orders.png';

  const cartItemsCount = currentDensityCalculation?.populations?.length || 0;

  return (
    <>
      <div className="app-header d-none d-md-flex">
        <div 
          className="app-header-main"
          onClick={() => handleNavigation('/')}
          style={{ cursor: 'pointer' }}
        >
          ЧИСЛЕННОСТЬ
        </div>
        <div className="app-header-dot">.РФ</div>
        <div className="app-header-dop d-none d-lg-block">
          главный вычислительный портал страны
        </div>
        
        <div className="d-flex align-items-center gap-4" style={{ position: 'fixed', right: '20px', top: '20px' }}>
          {isAuthenticated ? (
            <>
              <div className="d-flex align-items-center gap-2">
                
                <div 
                  className="nav-service-top position-relative"
                  onClick={() => handleNavigation('/density-calculations')}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src="http://localhost:9000/static/img/density_calculation.png"
                    alt="Расчеты плотности"
                    style={{ width: '24px', height: '24px', marginRight: '8px' }}
                  />
                  <span>Моя корзина</span>
                  {cartItemsCount > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      style={{ 
                        position: 'absolute', 
                        top: '-8px', 
                        right: '-8px',
                        fontSize: '12px'
                      }}
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={() => handleNavigation('/login')}
              >
                Вход
              </Button>
              <Button 
                variant="light" 
                size="sm"
                onClick={() => handleNavigation('/register')}
              >
                Регистрация
              </Button>
            </>
          )}
          
          <div 
            className="nav-service-top"
            onClick={() => handleNavigation('/populations')}
            style={{ cursor: 'pointer' }}
          >
            <img 
              src={populationsIconSrc}
              alt="Типы населения"
              style={{ width: '24px', height: '24px', marginRight: '8px' }}
              onError={() => setPopulationsIconError(true)}
            />
            <span>Услуги</span>
          </div>
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
                  alt="Типы населения"
                  style={{ width: '20px', height: '20px', marginRight: '5px' }}
                  onError={() => setPopulationsIconError(true)}
                />
                Услуги
              </Nav.Link>
              
              {isAuthenticated ? (
                <>
                  <Nav.Link className="app-btn" onClick={() => handleNavigation('/density-calculations')}>
                    Расчеты
                    {cartItemsCount > 0 && (
                      <Badge bg="danger" pill className="ms-1">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Nav.Link>
                  <Nav.Link onClick={handleLogout}>Выйти</Nav.Link>
                  <Nav.Link disabled>
                    {user?.first_name || user?.username}
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link onClick={() => handleNavigation('/login')}>Вход</Nav.Link>
                  <Nav.Link onClick={() => handleNavigation('/register')}>Регистрация</Nav.Link>
                </>
              )}
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
    </>
  );
};

export default MyNavbar;