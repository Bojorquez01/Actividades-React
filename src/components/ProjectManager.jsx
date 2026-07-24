import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ProjectManager({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al cargar proyectos:', error);
    } else {
      setProjects(data || []);
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: newProjectName }])
      .select();

    if (error) {
      console.error('Error al crear proyecto:', error);
    } else if (data && data[0]) {
      setProjects([data[0], ...projects]);
      onSelectProject(data[0]); // Entrar directamente al tablero del nuevo proyecto
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'sans-serif' }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Mis Proyectos</h3>
      
      {/* Formulario para nuevo proyecto */}
      <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Nombre del nuevo proyecto..." 
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={{ flex: 1, padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Crear Proyecto
        </button>
      </form>

      {/* Lista de proyectos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {projects.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>No tienes proyectos creados aún. ¡Crea uno arriba!</p>
        ) : (
          projects.map(proj => (
            <div 
              key={proj.id} 
              onClick={() => onSelectProject(proj)}
              style={{ padding: '15px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dcdde1', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
            >
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{proj.name}</span>
              <span style={{ fontSize: '13px', color: '#007bff', fontWeight: 'bold' }}>Abrir Tablero →</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectManager;