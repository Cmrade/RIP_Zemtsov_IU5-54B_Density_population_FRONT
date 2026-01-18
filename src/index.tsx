import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';
import * as serviceWorkerRegistration from '../serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Удаляем данные аутентификации при каждой загрузке страницы (F5)
if (window.performance) {
  if (performance.navigation.type === 1) {
    // Страница была обновлена (F5 или Ctrl+R)
    console.log('Страница была обновлена - разлогиниваем пользователя');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Также очищаем все данные Redux в localStorage (если используете redux-persist)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('redux') || key.startsWith('persist:')) {
        localStorage.removeItem(key);
      }
    });
  }
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

serviceWorkerRegistration.register();