import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Alert, Spinner, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  getCart, 
  removeFromCart, 
  formApplication,
  getApplications 
} from '../store/cartSlice';
import { logout } from '../store/authSlice';

const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { 
    currentApplication, 
    applications, 
    loading, 
    error 
  } = useAppSelector((state) => state.cart);
  
  const [territoryArea, setTerritoryArea] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
      dispatch(getApplications());
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, dispatch, navigate]);

  const handleRemoveFromCart = async (orderId: number) => {
    if (currentApplication) {
      try {
        await dispatch(removeFromCart({
          applicationId: currentApplication.id,
          orderId
        })).unwrap();
        dispatch(getCart()); // Обновляем корзину после удаления
      } catch (error) {
        console.error('Error removing from cart:', error);
        alert('Ошибка удаления услуги');
      }
    }
  };

  const handleFormApplication = async () => {
    if (!territoryArea || isNaN(parseFloat(territoryArea))) {
      setFormError('Введите корректную площадь территории');
      return;
    }

    if (!currentApplication || !currentApplication.orders || currentApplication.orders.length === 0) {
      setFormError('Добавьте услуги в заявку');
      return;
    }

    try {
      await dispatch(formApplication({
        applicationId: currentApplication.id,
        territory_area: parseFloat(territoryArea)
      })).unwrap();
      setTerritoryArea('');
      alert('Заявка успешно сформирована!');
      dispatch(getApplications()); // Обновляем список заявок
      setViewMode('history');
    } catch (error: any) {
      console.error('Form application error:', error);
      setFormError(error || 'Ошибка формирования заявки');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Функция для форматирования даты
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading && !currentApplication && !applications.length) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p className="mt-3">Загрузка...</p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <Alert variant="warning">
          Пожалуйста, авторизуйтесь для просмотра заявок
        </Alert>
        <Button onClick={() => navigate('/login')}>Войти</Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Мои заявки</h1>
        <div className="d-flex gap-3 align-items-center">
          <span>Привет, {user?.username}!</span>
          <Button variant="outline-danger" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Button
          variant={viewMode === 'current' ? 'primary' : 'outline-primary'}
          onClick={() => setViewMode('current')}
          className="me-2"
        >
          Текущая заявка
        </Button>
        <Button
          variant={viewMode === 'history' ? 'primary' : 'outline-primary'}
          onClick={() => setViewMode('history')}
        >
          История заявок
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {formError && <Alert variant="danger">{formError}</Alert>}

      {viewMode === 'current' ? (
        <Card>
          <Card.Header>
            <h3>Текущая заявка (черновик)</h3>
            {currentApplication && (
              <p className="mb-0 text-muted">
                ID заявки: {currentApplication.id}
              </p>
            )}
          </Card.Header>
          <Card.Body>
            {!currentApplication || !currentApplication.orders || currentApplication.orders.length === 0 ? (
              <Alert variant="info">
                В вашей заявке пока нет услуг. Добавьте услуги со страницы услуг.
              </Alert>
            ) : (
              <>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Услуга</th>
                      <th>Комментарий</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentApplication.orders.map((item: any, index: number) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={item.order_image || '/default-image.jpg'} 
                              alt={item.order_title}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-image.jpg';
                              }}
                            />
                            <span>{item.order_title}</span>
                          </div>
                        </td>
                        <td>{item.comment || 'Без комментария'}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.order)}
                            disabled={loading}
                          >
                            Удалить
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="mt-4">
                  <h4>Формирование заявки</h4>
                  <Form.Group className="mb-3">
                    <Form.Label>Площадь территории (кв. км)</Form.Label>
                    <Form.Control
                      type="number"
                      value={territoryArea}
                      onChange={(e) => setTerritoryArea(e.target.value)}
                      placeholder="Введите площадь"
                      style={{ maxWidth: '300px' }}
                      min="0.01"
                      step="0.01"
                    />
                    <Form.Text className="text-muted">
                      Введите площадь территории для расчета численности населения
                    </Form.Text>
                  </Form.Group>

                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleFormApplication}
                    disabled={!territoryArea || loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      'Сформировать заявку'
                    )}
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Header>
            <h3>История заявок</h3>
          </Card.Header>
          <Card.Body>
            {applications.length === 0 ? (
              <Alert variant="info">
                У вас нет сформированных заявок
              </Alert>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Статус</th>
                    <th>Дата создания</th>
                    <th>Дата формирования</th>
                    <th>Площадь (кв. км)</th>
                    <th>Количество услуг</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app: any) => (
                    <tr key={app.id}>
                      <td>{app.id}</td>
                      <td>
                        <span className={`badge ${
                          app.status === 'FORMED' ? 'bg-warning' :
                          app.status === 'COMPLETED' ? 'bg-success' :
                          app.status === 'REJECTED' ? 'bg-danger' : 
                          app.status === 'DRAFT' ? 'bg-secondary' : 'bg-info'
                        }`}>
                          {app.status === 'DRAFT' ? 'ЧЕРНОВИК' :
                           app.status === 'FORMED' ? 'СФОРМИРОВАНА' :
                           app.status === 'COMPLETED' ? 'ЗАВЕРШЕНА' :
                           app.status === 'REJECTED' ? 'ОТКЛОНЕНА' : app.status}
                        </span>
                      </td>
                      <td>{formatDate(app.creation_datetime)}</td>
                      <td>{formatDate(app.formation_datetime)}</td>
                      <td>{app.territory_area ? `${app.territory_area}` : '-'}</td>
                      <td>{app.orders_count || app.orders?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ApplicationsPage;