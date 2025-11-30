import React, { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MyNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [ordersIconError, setOrdersIconError] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const ordersIconSrc = ordersIconError 
    ? '/default-image.jpg' 
    : 'http://localhost:9000/static/img/orders.png';

  return (
    <>
      {/* Кастомная шапка как в Django с навигацией */}
      <div className="app-header">
        {/* Логотип и название */}
        <div 
          className="app-header-main"
          style={{ cursor: 'pointer' }}
          onClick={() => handleNavigation('/')}
        >
          ЧИСЛЕННОСТЬ
        </div>
        <div className="app-header-dot">.РФ</div>
        <div className="app-header-dop">главный вычислительный портал страны</div>
        
        <div 
          className="nav-service-top"
          onClick={() => handleNavigation('/orders')}
        >
          <img 
            src={ordersIconSrc}
            alt="Услуги"
            style={{ width: '30px', height: '30px' }}
            onError={() => setOrdersIconError(true)}
          />
          Услуги
        </div>
      </div>

      
    </>
  );
};

export default MyNavbar;