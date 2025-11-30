import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FilterComponent from '../components/FilterComponent';
import OrderCard from '../components/OrderCard';
import { Order } from '../types';
import { apiService } from '../services/api';

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await apiService.getOrders();
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    const searchOrders = async () => {
      if (searchTerm.trim() === '') {
        setFilteredOrders(orders);
      } else {
        try {
          const searchedOrders = await apiService.searchOrders(searchTerm);
          setFilteredOrders(searchedOrders);
        } catch (error) {
          console.error('Ошибка поиска:', error);
          // Фильтрация локально как fallback
          const filtered = orders.filter(order =>
            order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.main_information.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredOrders(filtered);
        }
      }
    };

    searchOrders();
  }, [searchTerm, orders]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Container>
      <h1 className="my-4">Этнографические данные</h1>
      
      <FilterComponent
        searchTerm={searchTerm} 
        onSearchChange={handleSearch} 
      />
      
      <Row className='cards'>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <Col key={order.id} md={6} lg={4} className="mb-4">
              <OrderCard order={order} />
            </Col>
          ))
        ) : (
          <Col>
            <div className="text-center py-4">
              <h3>Услуги не найдены</h3>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default OrdersList;