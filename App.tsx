// src/App.tsx
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import Home from './pages/Home';
import PopulationsList from './pages/PopulationsList';
import PopulationDetail from './pages/PopulationDetail';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Container fluid className="main-container">
          <Breadcrumbs />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/populations" element={<PopulationsList />} />
            <Route path="/populations/:id" element={<PopulationDetail />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;