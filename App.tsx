import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import Home from './pages/Home';
import PopulationsList from './pages/PopulationsList';
import PopulationDetail from './pages/PopulationDetail';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <Container fluid>
            <div style={{ padding: '10px', backgroundColor: 'yellow' }}>
              Current Path: {window.location.pathname}
            </div>
            
            <div>
              <Breadcrumbs />
            </div>
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/populations" element={<PopulationsList />} />
              <Route path="/populations/:id" element={<PopulationDetail />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </Provider>
  );
}

export default App;