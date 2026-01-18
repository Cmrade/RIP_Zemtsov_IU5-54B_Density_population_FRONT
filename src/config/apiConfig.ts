export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/users/login/',
  REGISTER: '/users/register/',
  PROFILE: '/users/profile/',
  LOGOUT: '/users/logout/',
  
  // Orders endpoints
  ORDERS: '/orders/',
  ORDER_DETAIL: (id: number) => `/orders/${id}/`,
  UPLOAD_ORDER_IMAGE: (id: number) => `/orders/${id}/upload_image/`,
  SEARCH_ORDERS: (title: string) => `/orders/?title=${encodeURIComponent(title)}`,
  
  // Applications endpoints
  APPLICATIONS: '/applications/',
  APPLICATION_DETAIL: (id: number) => `/applications/${id}/`,
  FORM_APPLICATION: (id: number) => '/applications/${id}/form/',
  ADD_TO_APPLICATION: (orderId: number) => `/add_to_application/${orderId}/`,
  REMOVE_FROM_APPLICATION: (applicationId: number, orderId: number) => 
    `/applications/${applicationId}/orders/${orderId}/`,
  
  // Cart endpoint
  CART: '/cart/',
};