import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register, clearError } from '../store/authSlice';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/density-calculations');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearError());

    // Валидация
    if (formData.password !== formData.password_confirm) {
      setFormError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Пароль должен быть не менее 6 символов');
      return;
    }

    try {
      await dispatch(register(formData)).unwrap();
      navigate('/density-calculations');
    } catch (error) {
      // Ошибка уже обработана в slice
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '500px', padding: '30px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Регистрация</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {formError && <Alert variant="danger">{formError}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Имя пользователя *</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Введите имя пользователя"
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введите email"
                disabled={loading}
              />
            </Form.Group>

            <div className="row">
              <div className="col">
                <Form.Group className="mb-3">
                  <Form.Label>Имя</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Введите имя"
                    disabled={loading}
                  />
                </Form.Group>
              </div>
              <div className="col">
                <Form.Group className="mb-3">
                  <Form.Label>Фамилия</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Введите фамилию"
                    disabled={loading}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Пароль *</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Подтверждение пароля *</Form.Label>
              <Form.Control
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Подтвердите пароль"
                required
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
                'Зарегистрироваться'
              )}
            </Button>

            <div className="text-center">
              <p>
                Уже есть аккаунт?{' '}
                <Link to="/login">Войдите</Link>
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

export default RegisterPage;