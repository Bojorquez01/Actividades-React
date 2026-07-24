import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ProjectManager({ selectedProject, setSelectedProject }) {
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
      // Si hay proyectos y ninguno seleccionado, seleccionamos el primero por defecto
      if (data && data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
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
      setSelectedProject(data[0]); // Seleccionar el recién creado
      setNewProjectName('');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', background: '#f8f9fa', padding: '10px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Proyecto Actual:</label>
        <select 
          value={selectedProject ? selectedProject.id : ''} 
          onChange={(e) => {
            const found = projects.find(p => p.id === Number(e.target.value));
            setSelectedProject(found);
          }}
          style={{ width: '100%', padding: '6px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {projects.length === 0 ? (
            <option value="">No hay proyectos creados</option>
          ) : (
            projects.map(proj => (
              <option key={proj.id} value={proj.id}>{proj.name}</option>
            ))
          )}
        </select>
      </div>

      <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Nuevo Proyecto:</label>
          <input 
            type="text" 
            placeholder="Nombre del proyecto..." 
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            style={{ padding: '6px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '7px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '33px' }}
        >
          + Crear
        </button>
      </form>
    </div>
  );
}

export default ProjectManager;