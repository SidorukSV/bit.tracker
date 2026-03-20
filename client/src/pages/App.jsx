import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { AuthForm } from '../components/AuthForm.jsx';
import { ProjectPanel } from '../components/ProjectPanel.jsx';

export function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!token) return;
    api('/projects', { token })
      .then(setProjects)
      .catch(() => setToken(''));
  }, [token]);

  async function login({ email, password }) {
    const result = await api('/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('token', result.token);
    setToken(result.token);
  }

  async function createProject(name) {
    const project = await api('/projects', {
      token,
      method: 'POST',
      body: { name }
    });
    setProjects((prev) => [project, ...prev]);
  }

  if (!token) {
    return (
      <main className="layout">
        <h1>Bit Tracker</h1>
        <p>Базовый UI для проверки API.</p>
        <AuthForm onLogin={login} />
      </main>
    );
  }

  return (
    <main className="layout">
      <header className="header">
        <h1>Bit Tracker</h1>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            setToken('');
          }}
        >
          Выйти
        </button>
      </header>

      <ProjectPanel projects={projects} onCreate={createProject} />
    </main>
  );
}
