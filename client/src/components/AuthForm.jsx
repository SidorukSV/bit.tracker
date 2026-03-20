import { useState } from 'react';

export function AuthForm({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('Admin User');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'register') {
        await onRegister({ email, password, fullName });
      } else {
        await onLogin({ email, password });
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>

      {mode === 'register' && (
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Полное имя"
        />
      )}

      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Пароль" />

      <button type="submit">{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</button>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
      </button>

      {error && <p className="error">{error}</p>}
    </form>
  );
}
