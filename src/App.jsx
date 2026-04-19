import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReadersList from './pages/ReadersList';
import ReaderForm from './pages/ReaderForm';
import BooksList from './pages/BooksList';
import BookForm from './pages/BookForm';
import BookCopiesList from './pages/BookCopiesList';
import LoansList from './pages/LoansList';
import LoanForm from './pages/LoanForm';
import PublicationPointsList from './pages/PublicationPointsList';
import PublicationPointForm from './pages/PublicationPointForm';
import CategoriesList from './pages/CategoriesList';
import CategoryForm from './pages/CategoryForm';
import AuthorsList from './pages/AuthorsList';
import AuthorForm from './pages/AuthorForm';
import FinesList from './pages/FinesList';
import FineForm from './pages/FineForm';
import LostBooksList from './pages/LostBooksList';
import LostBookForm from './pages/LostBookForm';
import LoanBansList from './pages/LoanBansList';
import LoanBanForm from './pages/LoanBanForm';
import InterlibraryOrdersList from './pages/InterlibraryOrdersList';
import InterlibraryOrderForm from './pages/InterlibraryOrderForm';
import Statistics from './pages/Statistics';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Readers */}
          <Route path="readers" element={<ReadersList />} />
          <Route path="readers/new" element={<ReaderForm />} />
          <Route path="readers/:id" element={<ReaderForm />} />
          
          {/* Books */}
          <Route path="books" element={<BooksList />} />
          <Route path="books/new" element={<BookForm />} />
          <Route path="books/:id" element={<BookForm />} />
          
          {/* Book Copies */}
          <Route path="book-copies" element={<BookCopiesList />} />
          
          {/* Loans */}
          <Route path="loans" element={<LoansList />} />
          <Route path="loans/new" element={<LoanForm />} />
          <Route path="loans/:id/return" element={<LoanForm isReturn />} />
          
          {/* Publication Points */}
          <Route path="publication-points" element={<PublicationPointsList />} />
          <Route path="publication-points/new" element={<PublicationPointForm />} />
          <Route path="publication-points/:id" element={<PublicationPointForm />} />
          
          {/* Categories */}
          <Route path="categories" element={<CategoriesList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id" element={<CategoryForm />} />
          
          {/* Authors */}
          <Route path="authors" element={<AuthorsList />} />
          <Route path="authors/new" element={<AuthorForm />} />
          <Route path="authors/:id" element={<AuthorForm />} />
          
          {/* Fines */}
          <Route path="fines" element={<FinesList />} />
          <Route path="fines/new" element={<FineForm />} />
          
          {/* Lost Books */}
          <Route path="lost-books" element={<LostBooksList />} />
          <Route path="lost-books/new" element={<LostBookForm />} />
          
          {/* Loan Bans */}
          <Route path="loan-bans" element={<LoanBansList />} />
          <Route path="loan-bans/new" element={<LoanBanForm />} />
          
          {/* Interlibrary Orders */}
          <Route path="interlibrary-orders" element={<InterlibraryOrdersList />} />
          <Route path="interlibrary-orders/new" element={<InterlibraryOrderForm />} />
          
          {/* Statistics */}
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;