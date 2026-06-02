import { useState } from 'react';
import { authAPI } from '../../services/api';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = isRegister 
        ? await authAPI.register({ username, password })
        : await authAPI.login({ username, password });

      setUser(data.user, data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl"style={{padding:"16px"}}>
        {/* Логотип */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Dungmusic</h1>
          <p className="text-muted">
            {isRegister ? 'Создать аккаунт' : 'Войти в аккаунт'}
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-m">
            {error}
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-m font-medium text-muted mb-2">
              {isRegister ? 'Имя пользователя' : 'Имя пользователя'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-m focus:outline-none focus:border-primary transition-colors"style={{padding:"6px"}}
              placeholder={isRegister ? "Придумайте имя" : "Введите имя"}
            />
          </div>

          <div>
            <label className="block text-m font-medium text-muted mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"style={{padding:"6px"}}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
          </button>
        </form>

        {/* Переключатель */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted">
            {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-primary hover:text-white transition-colors font-medium"
            >
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}