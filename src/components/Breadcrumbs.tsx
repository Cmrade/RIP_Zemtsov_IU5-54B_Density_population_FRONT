import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  
  console.log('Current location:', location.pathname); // Для отладки
  
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <div style={{ padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid red' }}>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Главная
        </Breadcrumb.Item>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <Breadcrumb.Item active key={to}>
              {value}
            </Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item linkAs={Link} linkProps={{ to }} key={to}>
              {value}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;