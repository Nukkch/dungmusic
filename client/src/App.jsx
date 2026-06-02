import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  const { clearUser, isAuthenticated, user } = useStore();

  const handleLogout = () => {
    clearUser();
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg text-text font-sans">
        
        {isAuthenticated && (
          <header className="h-[52px] border-b border-border flex items-center justify-between px-6 bg-bg sticky top-0 z-50" style={{marginBottom:"20px"}}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary"></div>
            <img 
              src="/logo.png" 
              alt="Dungemusic" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-xl font-bold tracking-wide">Dungmusic</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-m text-muted">
              {user?.username || 'Guest'}
            </span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-surface border border-border rounded-lg text-m hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors" style={{paddingLeft:"4px", paddingRight:"4px",marginRight:"20px"}}
            >
              Выйти
            </button>
          </div>
        </header>
        )}

        <main className={isAuthenticated ? '' : ''}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;