import React from 'react';
import { Container, Card } from 'react-bootstrap';

const Home: React.FC = () => {
  return (
    <Container>
      <Card className="bg-light p-5 mb-4 border-0 shadow-sm">
        <Card.Body className="text-center">
          <h1 className="main-title">Добро пожаловать на портал ЧИСЛЕННОСТЬ.РФ</h1>
          <p className="lead">
            Главный вычислительный портал страны для расчета численности населения 
            на основе этнографических данных и археологических исследований.
          </p>
          <p className="lead-2">
            Используйте наши услуги для точного расчета плотности населения 
            в различных типах поселений.
          </p>
        </Card.Body>
      </Card>
      
      <div className="mt-5">
        <h2>О нашем сервисе</h2>
        <p>
          Мы предоставляем уникальные расчеты численности населения на основе 
          археологических данных и этнографических исследований.
        </p>
        
        <div className="row mt-4">
          <div className="information_card_on_home">
            <Card>
              <Card.Body>
                <Card.Title>Точные расчеты</Card.Title>
                <Card.Text>
                  Используем проверенные методики для вычисления плотности населения
                  на основе археологических данных.
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
          <div className="information_card_on_home">
            <Card>
              <Card.Body>
                <Card.Title>Этнографические данные</Card.Title>
                <Card.Text>
                  Анализируем различные типы поселений от древних городов 
                  до крепостей и сел.
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
          <div className="information_card_on_home">
            <Card>
              <Card.Body>
                <Card.Title>Научный подход</Card.Title>
                <Card.Text>
                  Все расчеты основаны на научных исследованиях и 
                  исторических данных.
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Home;