import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/authSlice';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/density-calculations');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearError());

    if (!username || !password) {
      setFormError('Заполните все поля');
      return;
    }

    try {
      await dispatch(login({ username, password })).unwrap();
      navigate('/density-calculations');
    } catch (error) {
      // Ошибка уже обработана в slice
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px', padding: '30px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Вход в систему</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {formError && <Alert variant="danger">{formError}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Имя пользователя</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите имя пользователя"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                disabled={loading}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Войти'
              )}
            </Button>

            <div className="text-center">
              <p>
                Нет аккаунта?{' '}
                <Link to="/register">Зарегистрируйтесь</Link>
              </p>
              <p>
                <Link to="/">Вернуться на главную</Link>
              </p>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;