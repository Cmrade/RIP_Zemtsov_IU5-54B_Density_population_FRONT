import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { CartProvider } from './contexts/CartContext'; // Импортируем CartProvider
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import Home from './pages/Home';
import PopulationsList from './pages/PopulationsList';
import PopulationDetail from './pages/PopulationDetail';
import DensityCalculationsPage from './pages/DensityCalculationsPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

// Импортируем тестовую страницу поиска
import TestSearchPage from './pages/TestSearchPage';

// Создаем обертку для защищенных маршрутов с использованием Context
const ProtectedRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

function App() {
  return (
    <Provider store={store}>
      {/* Оборачиваем приложение в CartProvider - теперь корзина доступна во всем приложении через useContext */}
      <CartProvider>
        <Router basename="/react-population-app">
          <div className="App">
            <Navbar />
            <Container fluid>
              <Breadcrumbs />
              
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/populations" element={<PopulationsList />} />
                <Route path="/populations/:id" element={<PopulationDetail />} />
                
                {/* Защищенные маршруты - требуют аутентификации */}
                <Route 
                  path="/density-calculations" 
                  element={
                    <ProtectedRouteWrapper>
                      <DensityCalculationsPage />
                    </ProtectedRouteWrapper>
                  } 
                />
                
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Добавьте маршрут для тестовой страницы поиска */}
                <Route path="/test-search" element={<TestSearchPage />} />
                
                {/* Добавьте fallback маршрут */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </div>
        </Router>
      </CartProvider>
    </Provider>
  );
}

export default App;