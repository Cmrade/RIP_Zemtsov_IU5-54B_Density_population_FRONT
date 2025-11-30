import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import Home from './pages/Home';
import OrdersList from './pages/OrdersList';
import OrderDetail from './pages/OrderDetail';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css'; // Подключаем здесь

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Container fluid>
          {/* Временно показываем текущий путь для отладки */}
          <div style={{ padding: '10px', backgroundColor: 'yellow' }}>
            Current Path: {window.location.pathname}
          </div>
          
          <div>
            <Breadcrumbs />
          </div>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;