import { useState } from 'react';

export function ProjectPanel({ projects, onCreate }) {
  const [name, setName] = useState('');

  return (
    <div className="card">
      <h2>Проекты</h2>
      <div className="row">
        <input
          placeholder="Название проекта"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={() => {
            if (!name.trim()) return;
            onCreate(name.trim());
            setName('');
          }}
        >
          Создать
        </button>
      </div>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
