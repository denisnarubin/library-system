import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Панель управления', icon: '📊' },
    { path: '/readers', label: 'Читатели', icon: '👥' },
    { path: '/books', label: 'Книги', icon: '📚' },
    { path: '/book-copies', label: 'Экземпляры', icon: '📖' },
    { path: '/loans', label: 'Выдача книг', icon: '📝' },
    { path: '/publication-points', label: 'Пункты выдачи', icon: '🏢' },
    { path: '/categories', label: 'Категории', icon: '🏷️' },
    { path: '/authors', label: 'Авторы', icon: '✍️' },
    { path: '/fines', label: 'Штрафы', icon: '💰' },
    { path: '/lost-books', label: 'Утерянные книги', icon: '📕' },
    { path: '/loan-bans', label: 'Лишение права', icon: '🚫' },
    { path: '/interlibrary-orders', label: 'МБА заказы', icon: '📦' },
    { path: '/statistics', label: 'Статистика', icon: '📈' },
  ];

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="logo">📖 Библиотека</h1>
          {sidebarOpen && <span className="subtitle">Система управления</span>}
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''} ${!sidebarOpen ? 'tooltip' : ''}`
                  }
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div className="header-title">
            <h2>
              {menuItems.find(item => item.path === location.pathname)?.label || 'Библиотека'}
            </h2>
          </div>
          <div className="header-user">
            <span className="user-name">Администратор</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;