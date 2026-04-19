// API service for Library Management System
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // Backend API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Reader Categories API
export const readerCategoriesAPI = {
  getAll: () => api.get('/reader-categories'),
  getById: (id) => api.get(`/reader-categories/${id}`),
  create: (data) => api.post('/reader-categories', data),
  update: (id, data) => api.put(`/reader-categories/${id}`, data),
  delete: (id) => api.delete(`/reader-categories/${id}`),
};

// Readers API
export const readersAPI = {
  getAll: (params) => api.get('/readers', { params }),
  getById: (id) => api.get(`/readers/${id}`),
  create: (data) => api.post('/readers', data),
  update: (id, data) => api.put(`/readers/${id}`, data),
  delete: (id) => api.delete(`/readers/${id}`),
  search: (query) => api.get('/readers/search', { params: { query } }),
};

// Students Details API
export const studentsAPI = {
  getByReaderId: (readerId) => api.get(`/students/${readerId}`),
  create: (data) => api.post('/students', data),
  update: (readerId, data) => api.put(`/students/${readerId}`, data),
};

// Teachers Details API
export const teachersAPI = {
  getByReaderId: (readerId) => api.get(`/teachers/${readerId}`),
  create: (data) => api.post('/teachers', data),
  update: (readerId, data) => api.put(`/teachers/${readerId}`, data),
};

// One-time Readers API
export const oneTimeReadersAPI = {
  getByReaderId: (readerId) => api.get(`/one-time-readers/${readerId}`),
  create: (data) => api.post('/one-time-readers', data),
  update: (readerId, data) => api.put(`/one-time-readers/${readerId}`, data),
};

// Publication Points API
export const publicationPointsAPI = {
  getAll: () => api.get('/publication-points'),
  getById: (id) => api.get(`/publication-points/${id}`),
  create: (data) => api.post('/publication-points', data),
  update: (id, data) => api.put(`/publication-points/${id}`, data),
  delete: (id) => api.delete(`/publication-points/${id}`),
};

// Library Cards API
export const libraryCardsAPI = {
  getAll: (params) => api.get('/library-cards', { params }),
  getById: (id) => api.get(`/library-cards/${id}`),
  create: (data) => api.post('/library-cards', data),
  update: (id, data) => api.put(`/library-cards/${id}`, data),
  delete: (id) => api.delete(`/library-cards/${id}`),
  issueCard: (data) => api.post('/library-cards/issue', data),
};

// Books API
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  search: (query) => api.get('/books/search', { params: { query } }),
};

// Authors API
export const authorsAPI = {
  getAll: () => api.get('/authors'),
  getById: (id) => api.get(`/authors/${id}`),
  create: (data) => api.post('/authors', data),
  update: (id, data) => api.put(`/authors/${id}`, data),
  delete: (id) => api.delete(`/authors/${id}`),
};

// Book Copies API
export const bookCopiesAPI = {
  getAll: (params) => api.get('/book-copies', { params }),
  getById: (id) => api.get(`/book-copies/${id}`),
  create: (data) => api.post('/book-copies', data),
  update: (id, data) => api.put(`/book-copies/${id}`, data),
  delete: (id) => api.delete(`/book-copies/${id}`),
  getByBookId: (bookId) => api.get(`/book-copies/book/${bookId}`),
};

// Book Loans API
export const bookLoansAPI = {
  getAll: (params) => api.get('/book-loans', { params }),
  getById: (id) => api.get(`/book-loans/${id}`),
  create: (data) => api.post('/book-loans', data),
  update: (id, data) => api.put(`/book-loans/${id}`, data),
  delete: (id) => api.delete(`/book-loans/${id}`),
  issueLoan: (data) => api.post('/book-loans/issue', data),
  returnBook: (loanId, data) => api.post(`/book-loans/${loanId}/return`, data),
  getCurrentLoans: (readerId) => api.get(`/book-loans/current/${readerId}`),
  getDebtors: (params) => api.get('/book-loans/debtors', { params }),
};

// Fines API
export const finesAPI = {
  getAll: (params) => api.get('/fines', { params }),
  getById: (id) => api.get(`/fines/${id}`),
  create: (data) => api.post('/fines', data),
  update: (id, data) => api.put(`/fines/${id}`, data),
  pay: (id) => api.post(`/fines/${id}/pay`),
};

// Lost Books API
export const lostBooksAPI = {
  getAll: (params) => api.get('/lost-books', { params }),
  getById: (id) => api.get(`/lost-books/${id}`),
  create: (data) => api.post('/lost-books', data),
  update: (id, data) => api.put(`/lost-books/${id}`, data),
  markCompensated: (id) => api.post(`/lost-books/${id}/compensate`),
};

// Loan Bans API
export const loanBansAPI = {
  getAll: (params) => api.get('/loan-bans', { params }),
  getById: (id) => api.get(`/loan-bans/${id}`),
  create: (data) => api.post('/loan-bans', data),
  update: (id, data) => api.put(`/loan-bans/${id}`, data),
  delete: (id) => api.delete(`/loan-bans/${id}`),
};

// Interlibrary Orders API
export const interlibraryOrdersAPI = {
  getAll: (params) => api.get('/interlibrary-orders', { params }),
  getById: (id) => api.get(`/interlibrary-orders/${id}`),
  create: (data) => api.post('/interlibrary-orders', data),
  update: (id, data) => api.put(`/interlibrary-orders/${id}`, data),
  printRequest: (data) => api.post('/interlibrary-orders/print', data),
};

// Statistics API
export const statisticsAPI = {
  getTopBooksInHall: (pointName) => api.get('/statistics/top-books', { params: { pointName } }),
  getBooksArrivedLost: (authorName) => api.get('/statistics/books-arrived-lost', { params: { authorName } }),
  getPointMaxDebtors: () => api.get('/statistics/point-max-debtors'),
  getMbaOrders: (period, daysBack) => api.get('/statistics/mba-orders', { params: { period, daysBack } }),
  getTotalCopies: (bookTitle) => api.get('/statistics/total-copies', { params: { bookTitle } }),
  getBannedOver2Months: () => api.get('/statistics/banned-over-2months'),
  getNewReadersLastMonth: () => api.get('/statistics/new-readers-last-month'),
  getReadersByFaculty: (facultyName) => api.get('/statistics/readers-by-faculty', { params: { facultyName } }),
  getLongTermDebtors: (categoryName) => api.get('/statistics/long-term-debtors', { params: { categoryName } }),
  getReaderCurrentBooks: (readerLastname) => api.get('/statistics/reader-current-books', { params: { readerLastname } }),
};

export default api;