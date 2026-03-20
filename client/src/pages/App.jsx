import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { AuthForm } from '../components/AuthForm.jsx';
import { ProjectPanel } from '../components/ProjectPanel.jsx';

export function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [spaces, setSpaces] = useState([]);
  const [activeSpaceId, setActiveSpaceId] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!token) return;
    api('/spaces', { token }).then((result) => {
      setSpaces(result);
      if (result[0]) {
        setActiveSpaceId(result[0].id);
      }
    });
  }, [token]);

  useEffect(() => {
    if (!token || !activeSpaceId) return;
    api(`/projects?spaceId=${activeSpaceId}`, { token })
      .then(setProjects)
      .catch(() => setToken(''));
  }, [token, activeSpaceId]);

  async function login({ email, password }) {
    const result = await api('/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('token', result.token);
    setToken(result.token);
  }

  async function register({ email, password, fullName }) {
    const result = await api('/auth/register', {
      method: 'POST',
      body: { email, password, fullName }
    });
    localStorage.setItem('token', result.token);
    setToken(result.token);
  }

  async function createSpace() {
    const created = await api('/spaces', {
      token,
      method: 'POST',
      body: { name: `Space ${new Date().toLocaleDateString()}` }
    });
    setSpaces((prev) => [created, ...prev]);
    setActiveSpaceId(created.id);
  }

  async function createProject(name) {
    const project = await api('/projects', {
      token,
      method: 'POST',
      body: { name, spaceId: activeSpaceId }
    });
    setProjects((prev) => [project, ...prev]);
  }

  if (!token) {
    return (
      <main className="layout">
        <h1>Bit Tracker</h1>
        <p>Базовый UI для проверки API.</p>
        <AuthForm onLogin={login} onRegister={register} />
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

      <div className="card">
        <h2>Пространства</h2>
        <div className="row">
          <select value={activeSpaceId} onChange={(e) => setActiveSpaceId(e.target.value)}>
            {spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
          <button onClick={createSpace}>Создать пространство</button>
        </div>
      </div>

      <ProjectPanel projects={projects} onCreate={createProject} />
    </main>
  );
}
