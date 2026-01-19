import React, { useState, useEffect, useMemo, useReducer, useContext } from 'react'; // Добавляем useContext
import { Container, Button, Card, Alert, Spinner, Form, Table, Badge, OverlayTrigger, Tooltip, ToggleButton, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import axiosInstance from '../services/axiosInstance';
import { CartContext } from '../contexts/CartContext'; // Импортируем контекст

// Определяем типы для состояния
interface DensityCalculationsState {
  territoryArea: string;
  formError: string;
  viewMode: 'current' | 'history';
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  };
  filterToday: boolean;
  showDeleteModal: boolean;
  deleteLoading: boolean;
  editingCommentId: number | null;
}

// Определяем типы действий
type DensityCalculationsAction =
  | { type: 'SET_TERRITORY_AREA'; payload: string }
  | { type: 'SET_FORM_ERROR'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'current' | 'history' }
  | { type: 'SET_SORT_CONFIG'; payload: { key: string; direction: 'ascending' | 'descending' } }
  | { type: 'SET_FILTER_TODAY'; payload: boolean }
  | { type: 'SET_SHOW_DELETE_MODAL'; payload: boolean }
  | { type: 'SET_DELETE_LOADING'; payload: boolean }
  | { type: 'SET_EDITING_COMMENT_ID'; payload: number | null }
  | { type: 'RESET_FORM' }
  | { type: 'RESET_FILTERS' };

// Начальное состояние
const initialState: DensityCalculationsState = {
  territoryArea: '',
  formError: '',
  viewMode: 'current',
  sortConfig: {
    key: 'formation_datetime',
    direction: 'descending'
  },
  filterToday: false,
  showDeleteModal: false,
  deleteLoading: false,
  editingCommentId: null,
};

// Редьюсер для управления состоянием
const densityCalculationsReducer = (
  state: DensityCalculationsState,
  action: DensityCalculationsAction
): DensityCalculationsState => {
  switch (action.type) {
    case 'SET_TERRITORY_AREA':
      return { ...state, territoryArea: action.payload };
    
    case 'SET_FORM_ERROR':
      return { ...state, formError: action.payload };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_SORT_CONFIG':
      return { ...state, sortConfig: action.payload };
    
    case 'SET_FILTER_TODAY':
      return { ...state, filterToday: action.payload };
    
    case 'SET_SHOW_DELETE_MODAL':
      return { ...state, showDeleteModal: action.payload };
    
    case 'SET_DELETE_LOADING':
      return { ...state, deleteLoading: action.payload };
    
    case 'SET_EDITING_COMMENT_ID':
      return { ...state, editingCommentId: action.payload };
    
    case 'RESET_FORM':
      return { ...state, territoryArea: '', formError: '' };
    
    case 'RESET_FILTERS':
      return { 
        ...state, 
        filterToday: false,
        sortConfig: { key: 'formation_datetime', direction: 'descending' }
      };
    
    default:
      return state;
  }
};

const DensityCalculationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const cartContext = useContext(CartContext);
  
  if (!cartContext) {
    throw new Error('CartContext must be used within CartProvider');
  }
  
  const { 
    currentDensityCalculation, 
    densityCalculations, 
    loading, 
    error 
  } = cartContext;
  
  const {
    getCart,
    getDensityCalculations: fetchDensityCalculations,
    removePopulationFromDensityCalculation,
    formDensityCalculation,
    updatePopulationComment
  } = cartContext;
  
  // Используем useReducer вместо useState
  const [state, stateDispatch] = useReducer(densityCalculationsReducer, initialState);
  
  // Деструктурируем состояние
  const { 
    territoryArea, 
    formError, 
    viewMode, 
    sortConfig, 
    filterToday,
    showDeleteModal,
    deleteLoading,
    editingCommentId
  } = state;

  // Локальное состояние для редактируемых комментариев
  const [editingComments, setEditingComments] = useState<{[key: number]: string}>({});
  const [savingCommentId, setSavingCommentId] = useState<number | null>(null);

  useEffect(() => {
    console.log('DensityCalculationsPage mounted, isAuthenticated:', isAuthenticated);
    console.log('Current density calculation:', currentDensityCalculation);
    
    if (isAuthenticated) {
      getCart();
      fetchDensityCalculations();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    console.log('currentDensityCalculation updated:', currentDensityCalculation);
  }, [currentDensityCalculation]);

  const handleRemoveFromCart = async (populationInCalcId: number, populationId: number) => {
    if (currentDensityCalculation) {
      try {
        await removePopulationFromDensityCalculation(
          currentDensityCalculation.id,
          populationId
        );
      } catch (error) {
        console.error('Error removing from cart:', error);
        alert('Ошибка удаления типа населения');
      }
    }
  };

  const handleFormDensityCalculation = async () => {
    if (!territoryArea || isNaN(parseFloat(territoryArea))) {
      stateDispatch({ type: 'SET_FORM_ERROR', payload: 'Введите корректную площадь территории' });
      return;
    }

    if (!currentDensityCalculation || !currentDensityCalculation.populations || currentDensityCalculation.populations.length === 0) {
      stateDispatch({ type: 'SET_FORM_ERROR', payload: 'Добавьте типы населения в расчет плотности' });
      return;
    }

    try {
      await formDensityCalculation(
        currentDensityCalculation.id,
        parseFloat(territoryArea)
      );
      
      // Сбрасываем форму
      stateDispatch({ type: 'RESET_FORM' });
      
      alert('Расчет плотности успешно сформирован!');
      stateDispatch({ type: 'SET_VIEW_MODE', payload: 'history' });
    } catch (error: any) {
      console.error('Form density calculation error:', error);
      stateDispatch({ type: 'SET_FORM_ERROR', payload: error || 'Ошибка формирования расчета плотности' });
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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

  // Функция для проверки, является ли дата сегодняшней
  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    } catch (error) {
      return false;
    }
  };

  // Функция для обрезки длинного комментария
  const truncateComment = (comment: string, maxLength: number = 50) => {
    if (!comment) return '';
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + '...';
  };

  // Функция для обработки сортировки
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    stateDispatch({ 
      type: 'SET_SORT_CONFIG', 
      payload: { key, direction } 
    });
  };

  // Функция для отображения стрелочек сортировки
  const getSortArrow = (key: string) => {
    if (sortConfig.key !== key) {
      return '↕️';
    }
    return sortConfig.direction === 'ascending' ? '⬆️' : '⬇️';
  };

  // Получение стилей для заголовка сортируемой колонки
  const getHeaderStyle = (key: string) => {
    const isActive = sortConfig.key === key;
    return {
      cursor: 'pointer',
      backgroundColor: isActive ? '#e9ecef' : 'transparent',
      fontWeight: isActive ? 'bold' : 'normal',
      transition: 'background-color 0.2s ease'
    };
  };

  // Сортируем данные с учетом фильтра "За сегодня"
  const sortedCalculations = useMemo(() => {
    // Сначала фильтруем по статусу (не черновики и не удаленные)
    let filteredItems = densityCalculations
      .filter((calc: any) => calc.status !== 'DRAFT' && calc.status !== 'DELETED');

    // Применяем фильтр "За сегодня" если он включен
    if (filterToday) {
      filteredItems = filteredItems.filter((calc: any) => 
        isToday(calc.formation_datetime) || isToday(calc.creation_datetime)
      );
    }

    if (!sortConfig.key) return filteredItems;

    return [...filteredItems].sort((a: any, b: any) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      // Обработка дат
      if (sortConfig.key.includes('_datetime')) {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Обработка статусов (особый порядок)
      if (sortConfig.key === 'status') {
        const statusOrder: { [key: string]: number } = {
          'FORMED': 1,
          'COMPLETED': 2,
          'REJECTED': 3
        };
        aValue = statusOrder[a.status] || 99;
        bValue = statusOrder[b.status] || 99;
      }

      // Обработка числовых значений
      if (sortConfig.key === 'calculated_population' || sortConfig.key === 'territory_area') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      // Сравнение
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [densityCalculations, sortConfig, filterToday]);

  // Получаем количество заявок за сегодня
  const todayCalculationsCount = useMemo(() => {
    return densityCalculations.filter((calc: any) => 
      calc.status !== 'DRAFT' && calc.status !== 'DELETED' && 
      (isToday(calc.formation_datetime) || isToday(calc.creation_datetime))
    ).length;
  }, [densityCalculations]);

  // Вычисляем общую сумму расчетной численности для отображаемых расчетов
  const totalCalculatedPopulation = useMemo(() => {
    return sortedCalculations.reduce((total: number, calc: any) => {
      const population = calc.calculated_population_formatted || calc.calculated_population;
      
      if (typeof population === 'string') {
        const cleanStr = population.replace(/[^\d.,]/g, '').replace(',', '.');
        const num = parseFloat(cleanStr);
        return !isNaN(num) ? total + num : total;
      } else if (typeof population === 'number') {
        return total + population;
      }
      return total;
    }, 0);
  }, [sortedCalculations]);

  // Вычисляем общую сумму площади территории для отображаемых расчетов
  const totalTerritoryArea = useMemo(() => {
    return sortedCalculations.reduce((total: number, calc: any) => {
      const area = calc.territory_area_formatted || calc.territory_area;
      
      if (typeof area === 'string') {
        const cleanStr = area.replace(/[^\d.,]/g, '').replace(',', '.');
        const num = parseFloat(cleanStr);
        return !isNaN(num) ? total + num : total;
      } else if (typeof area === 'number') {
        return total + area;
      }
      return total;
    }, 0);
  }, [sortedCalculations]);

  // Сбрасываем все фильтры и сортировку
  const resetAllFilters = () => {
    stateDispatch({ type: 'RESET_FILTERS' });
  };

  // Форматируем числа с разделителями тысяч
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Функция для открытия модального окна удаления черновика
  const openDeleteModal = () => {
    stateDispatch({ type: 'SET_SHOW_DELETE_MODAL', payload: true });
  };

  // Функция для закрытия модального окна
  const closeDeleteModal = () => {
    stateDispatch({ type: 'SET_SHOW_DELETE_MODAL', payload: false });
    stateDispatch({ type: 'SET_DELETE_LOADING', payload: false });
  };

  // Функция для удаления черновой заявки
  const handleDeleteDraft = async () => {
    if (!currentDensityCalculation) return;
    
    stateDispatch({ type: 'SET_DELETE_LOADING', payload: true });
    
    try {
      await axiosInstance.delete(`/density_calculations/${currentDensityCalculation.id}/`);
      
      await getCart();
      await fetchDensityCalculations();
      
      alert(`Черновик расчета #${currentDensityCalculation.id} успешно удален!`);
      closeDeleteModal();
      navigate('/populations');
      
    } catch (error: any) {
      console.error('Ошибка удаления черновика:', error);
      
      let errorMessage = 'Не удалось удалить черновик расчета';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = 'У вас нет прав на удаление этого расчета';
      } else if (error.response?.status === 404) {
        errorMessage = 'Расчет не найден';
      }
      
      alert(`Ошибка: ${errorMessage}`);
      stateDispatch({ type: 'SET_DELETE_LOADING', payload: false });
    }
  };

  // Функция для начала редактирования комментария
  const startEditComment = (item: any) => {
    stateDispatch({ type: 'SET_EDITING_COMMENT_ID', payload: item.id });
    setEditingComments({
      ...editingComments,
      [item.id]: item.comment || ''
    });
  };

  // Функция для сохранения комментария
  const saveComment = async (item: any) => {
    if (!currentDensityCalculation) return;
    
    const newComment = editingComments[item.id] || '';
    setSavingCommentId(item.id);
    
    try {
      await updatePopulationComment(
        currentDensityCalculation.id,
        item.population,
        newComment
      );
      
      stateDispatch({ type: 'SET_EDITING_COMMENT_ID', payload: null });
      const newEditingComments = { ...editingComments };
      delete newEditingComments[item.id];
      setEditingComments(newEditingComments);
      
    } catch (error: any) {
      console.error('Ошибка обновления комментария:', error);
      
      let errorMessage = 'Не удалось обновить комментарий';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setSavingCommentId(null);
    }
  };

  // Функция для отмены редактирования комментария
  const cancelEditComment = (itemId: number) => {
    stateDispatch({ type: 'SET_EDITING_COMMENT_ID', payload: null });
    const newEditingComments = { ...editingComments };
    delete newEditingComments[itemId];
    setEditingComments(newEditingComments);
  };

  // Функция для обработки изменения значения комментария
  const handleCommentChange = (itemId: number, value: string) => {
    setEditingComments({
      ...editingComments,
      [itemId]: value
    });
  };

  // Модальное окно подтверждения удаления черновика
  const DeleteDraftModal = () => (
    <Modal show={showDeleteModal} onHide={closeDeleteModal}>
      <Modal.Header closeButton>
        <Modal.Title>Удаление черновика расчета</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {currentDensityCalculation && (
          <div>
            <p>Вы уверены, что хотите удалить черновик расчета <strong>#{currentDensityCalculation.id}</strong>?</p>
            
            {currentDensityCalculation.populations && currentDensityCalculation.populations.length > 0 ? (
              <Alert variant="danger" className="mt-3">
                ⚠️ В черновике содержится {currentDensityCalculation.populations.length} тип(ов) населения.
                Все добавленные типы населения будут удалены вместе с черновиком!
              </Alert>
            ) : (
              <Alert variant="info" className="mt-3">
                Черновик пуст. Вы можете безопасно удалить его.
              </Alert>
            )}
            
            <Alert variant="warning">
              ❗ Это действие нельзя отменить. Черновик будет помечен как удаленный и не подлежит восстановлению.
            </Alert>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={closeDeleteModal}
          disabled={deleteLoading}
        >
          Отмена
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDeleteDraft}
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Удаление...
            </>
          ) : (
            'Удалить черновик'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (loading && !currentDensityCalculation && !densityCalculations.length) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p className="mt-3">Загрузка расчетов плотности...</p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <Alert variant="warning">
          Пожалуйста, авторизуйтесь для просмотра расчетов плотности
        </Alert>
        <Button onClick={() => navigate('/login')}>Войти</Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Мои расчеты плотности</h1>
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
          onClick={() => stateDispatch({ type: 'SET_VIEW_MODE', payload: 'current' })}
          className="me-2"
        >
          Текущий расчет
          {currentDensityCalculation?.populations && currentDensityCalculation.populations.length > 0 && (
            <span className="badge bg-danger ms-2">
              {currentDensityCalculation.populations.length}
            </span>
          )}
        </Button>
        <Button
          variant={viewMode === 'history' ? 'primary' : 'outline-primary'}
          onClick={() => stateDispatch({ type: 'SET_VIEW_MODE', payload: 'history' })}
        >
          История расчетов
          <span className="badge bg-secondary ms-2">
            {densityCalculations.filter((calc: any) => calc.status !== 'DRAFT' && calc.status !== 'DELETED').length}
          </span>
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {formError && <Alert variant="danger">{formError}</Alert>}

      {viewMode === 'current' ? (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Текущий расчет плотности</h3>
            {currentDensityCalculation && (
              <Badge bg={currentDensityCalculation.status === 'DRAFT' ? 'secondary' : 'primary'}>
                {currentDensityCalculation.status === 'DRAFT' ? 'ЧЕРНОВИК' : currentDensityCalculation.status}
              </Badge>
            )}
          </Card.Header>
          <Card.Body>
            {!currentDensityCalculation || !currentDensityCalculation.populations || currentDensityCalculation.populations.length === 0 ? (
              <Alert variant="info">
                <p>В вашем расчете пока нет типов населения.</p>
                <p className="mb-0">
                  Перейдите на <a href="/populations">страницу типов населения</a>, чтобы добавить их в расчет.
                </p>
              </Alert>
            ) : (
              <>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Изображение</th>
                      <th>Тип населения</th>
                      <th>Комментарий</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDensityCalculation.populations.map((item: any, index: number) => (
                      <tr key={item.id || index}>
                        <td>{index + 1}</td>
                        <td>
                          <img 
                            src={item.population_image || '/default-image.jpg'} 
                            alt={item.population_title}
                            style={{ 
                              width: '80px', 
                              height: '60px', 
                              objectFit: 'cover',
                              borderRadius: '5px'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/default-image.jpg';
                            }}
                          />
                        </td>
                        <td>
                          <strong>{item.population_title}</strong>
                          {item.building_density && item.people_per_building && (
                            <div className="text-muted small mt-1">
                              Плотность: {item.building_density} домов/га × {item.people_per_building} чел/дом
                            </div>
                          )}
                        </td>
                        <td>
                          {editingCommentId === item.id ? (
                            <Form.Control
                              type="text"
                              value={editingComments[item.id] || ''}
                              onChange={(e) => handleCommentChange(item.id, e.target.value)}
                              placeholder="Введите комментарий"
                              autoFocus
                            />
                          ) : (
                            <span>{item.comment || 'Без комментария'}</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-2">
                            {editingCommentId === item.id ? (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => saveComment(item)}
                                  disabled={savingCommentId === item.id}
                                >
                                  {savingCommentId === item.id ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-2" />
                                      Сохранение...
                                    </>
                                  ) : (
                                    'Сохранить комментарий'
                                  )}
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => cancelEditComment(item.id)}
                                  disabled={savingCommentId === item.id}
                                >
                                  Отмена
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => startEditComment(item)}
                                >
                                  Изменить комментарий
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleRemoveFromCart(item.id, item.population)}
                                  disabled={loading}
                                >
                                  Удалить из расчета
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="mt-4 p-3 border rounded bg-light">
                  <h4>Формирование расчета плотности</h4>
                  <p className="text-muted">
                    Для расчета численности населения укажите площадь территории:
                  </p>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Площадь территории (га)</Form.Label>
                    <div className="d-flex align-items-center gap-3">
                      <Form.Control
                        type="number"
                        value={territoryArea}
                        onChange={(e) => stateDispatch({ type: 'SET_TERRITORY_AREA', payload: e.target.value })}
                        placeholder="Например: 10.5"
                        style={{ maxWidth: '200px' }}
                        min="0.01"
                        step="0.01"
                      />
                      <Button
                        variant="success"
                        size="lg"
                        onClick={handleFormDensityCalculation}
                        disabled={!territoryArea || loading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Формирование...
                          </>
                        ) : (
                          'Сформировать расчет'
                        )}
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Введите площадь территории в гектарах
                    </Form.Text>
                  </Form.Group>
                </div>

                {/* Кнопка для удаления черновика */}
                <div className="mt-3 p-3 border rounded bg-light">
                  <h5>Удаление черновика</h5>
                  <p className="text-muted">
                    Если вы хотите начать новый расчет, вы можете удалить текущий черновик.
                  </p>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/populations')}
                    className="me-2"
                  >
                    Сохранить и вернуться к услугам
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={openDeleteModal}
                  >
                    Удалить черновик
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">История расчетов плотности</h3>
                <p className="text-muted mb-0">Отображаются только сформированные расчеты</p>
              </div>
              <div className="d-flex gap-2 align-items-center">
                {/* Кнопка фильтра "За сегодня" */}
                <ToggleButton
                  id="toggle-today-filter"
                  type="checkbox"
                  variant={filterToday ? "warning" : "outline-warning"}
                  checked={filterToday}
                  value="1"
                  onChange={(e) => stateDispatch({ type: 'SET_FILTER_TODAY', payload: e.currentTarget.checked })}
                  size="sm"
                >
                  {filterToday ? '✓ За сегодня' : 'За сегодня'}
                  {todayCalculationsCount > 0 && (
                    <Badge bg="danger" pill className="ms-2">
                      {todayCalculationsCount}
                    </Badge>
                  )}
                </ToggleButton>
                
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={resetAllFilters}
                >
                  Сбросить все
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {sortedCalculations.length === 0 ? (
              <Alert variant="info">
                У вас нет сформированных расчетов плотности
              </Alert>
            ) : (
              <>
                {/* Информация о текущих фильтрах */}
                <Alert variant={filterToday ? "warning" : "info"} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>
                        {filterToday ? 'Фильтр: За сегодня' : 'Все расчеты'}
                      </strong>
                      {sortConfig.key && (
                        <span className="ms-3">
                          Сортировка: {
                            sortConfig.key === 'creation_datetime' ? 'Дата создания' : 
                            sortConfig.key === 'formation_datetime' ? 'Дата формирования' : 
                            sortConfig.key === 'status' ? 'Статус' : 
                            sortConfig.key === 'calculated_population' ? 'Расчетная численность' :
                            sortConfig.key === 'territory_area' ? 'Площадь территории' : 
                            sortConfig.key
                          } 
                          ({sortConfig.direction === 'ascending' ? '↑' : '↓'})
                        </span>
                      )}
                    </div>
                    <div>
                      <small>
                        {filterToday ? 
                          `Показаны расчеты за сегодня: ${sortedCalculations.length} из ${todayCalculationsCount}` :
                          `Показано ${sortedCalculations.length} из ${densityCalculations.filter((calc: any) => calc.status !== 'DRAFT' && calc.status !== 'DELETED').length} расчетов`
                        }
                      </small>
                    </div>
                  </div>
                </Alert>
                
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th  
                        onClick={() => requestSort('status')}
                        style={getHeaderStyle('status')}
                        className="hover-highlight"
                      >
                        Статус {getSortArrow('status')}
                      </th>
                      <th 
                        onClick={() => requestSort('creation_datetime')}
                        style={getHeaderStyle('creation_datetime')}
                        className="hover-highlight"
                      >
                        Дата создания {getSortArrow('creation_datetime')}
                      </th>
                      <th 
                        onClick={() => requestSort('formation_datetime')}
                        style={getHeaderStyle('formation_datetime')}
                        className="hover-highlight"
                      >
                        Дата формирования {getSortArrow('formation_datetime')}
                      </th>
                      <th 
                        onClick={() => requestSort('territory_area')}
                        style={getHeaderStyle('territory_area')}
                        className="hover-highlight"
                      >
                        Площадь (га) {getSortArrow('territory_area')}
                      </th>
                      <th 
                        onClick={() => requestSort('calculated_population')}
                        style={getHeaderStyle('calculated_population')}
                        className="hover-highlight"
                      >
                        Расчетная численность {getSortArrow('calculated_population')}
                      </th>
                      <th>Комментарий</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCalculations.map((calc: any) => {
                      const hasDescription = calc.description && calc.description.trim().length > 0;
                      const truncatedDescription = truncateComment(calc.description || '');
                      
                      return (
                        <tr key={calc.id}>
                          <td><strong>#{calc.id}</strong></td>
                          <td>
                            <span className={`badge ${
                              calc.status === 'FORMED' ? 'bg-warning' :
                              calc.status === 'COMPLETED' ? 'bg-success' :
                              calc.status === 'REJECTED' ? 'bg-danger' : 'bg-info'
                            }`}>
                              {calc.status === 'FORMED' ? 'СФОРМИРОВАН' :
                               calc.status === 'COMPLETED' ? 'ЗАВЕРШЕН' :
                               calc.status === 'REJECTED' ? 'ОТКЛОНЕН' : calc.status}
                            </span>
                          </td>
                          <td>{formatDate(calc.creation_datetime)}</td>
                          <td>{calc.formation_datetime ? formatDate(calc.formation_datetime) : '-'}</td>
                          <td>
                            {calc.territory_area_formatted 
                              ? <span className="fw-bold">{calc.territory_area_formatted} га</span>
                              : calc.territory_area
                                ? <span className="fw-bold">{calc.territory_area} га</span>
                                : '-'
                            }
                          </td>
                          <td>
                            {calc.calculated_population 
                              ? <span className="fw-bold text-success">{calc.calculated_population} чел.</span>
                              : calc.calculated_population_formatted
                                ? <span className="fw-bold text-success">{calc.calculated_population_formatted} чел.</span>
                                : calc.status === 'FORMED' 
                                  ? <span className="text-muted">В расчёте...</span> 
                                  : '-'
                            }
                          </td>
                          <td>
                            {hasDescription ? (
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-${calc.id}`}>
                                    {calc.description}
                                  </Tooltip>
                                }
                              >
                                <div 
                                  className="comment-cell"
                                  style={{
                                    cursor: 'help',
                                    maxHeight: '60px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {truncatedDescription}
                                </div>
                              </OverlayTrigger>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Строка ИТОГО */}
                  {sortedCalculations.length > 0 && (
                    <tfoot>
                      <tr style={{ backgroundColor: '#f8f9fa', borderTop: '2px solid #dee2e6' }}>
                        <td colSpan={4} style={{ textAlign: 'left', fontWeight: 'bold' }}>
                          ИТОГО (показано {sortedCalculations.length} расчетов):
                        </td>
                        <td style={{ fontWeight: 'bold', textAlign: 'left' }}>
                          {totalTerritoryArea > 0 ? formatNumber(totalTerritoryArea) + ' га' : '-'}
                        </td>
                        <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'left', color: '#198754' }}>
                          {totalCalculatedPopulation > 0 ? formatNumber(totalCalculatedPopulation) + ' чел.' : '-'}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </Table>
                
                <div className="mt-3 text-muted">
                  <small>
                    {filterToday 
                      ? `Показано ${sortedCalculations.length} расчетов за сегодня` +
                        (totalCalculatedPopulation > 0 ? ` | Общая численность: ${formatNumber(totalCalculatedPopulation)} чел.` : '')
                      : `Показано ${sortedCalculations.length} из ${densityCalculations.filter((calc: any) => calc.status !== 'DRAFT' && calc.status !== 'DELETED').length} расчетов` +
                        (totalCalculatedPopulation > 0 ? ` | Общая численность: ${formatNumber(totalCalculatedPopulation)} чел.` : '')
                    }
                  </small>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Модальное окно подтверждения удаления черновика */}
      <DeleteDraftModal />
    </Container>
  );
};

export default DensityCalculationsPage;