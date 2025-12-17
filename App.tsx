//import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import Home from './pages/Home';
import PopulationsList from './pages/PopulationsList';
import PopulationDetail from './pages/PopulationDetail';
import ApplicationsPage from './pages/ApplicationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <Container fluid>
            <Breadcrumbs />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/populations" element={<PopulationsList />} />
              <Route path="/populations/:id" element={<PopulationDetail />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </Provider>
  );
}

export default App;