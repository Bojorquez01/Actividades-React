import { useState, useEffect } from 'react';
import ProjectManager from './components/ProjectManager';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import Auth from './components/Auth';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTaskForModal, setActiveTaskForModal] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar tareas cada vez que cambie el proyecto seleccionado
  useEffect(() => {
    if (session && selectedProject) {
      fetchTasks(selectedProject.id);
    } else {
      setTasks([]);
    }
  }, [session, selectedProject]);

  async function fetchTasks(projectId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('id', { ascending: false });

    if (error) console.error('Error al obtener tareas:', error);
    else setTasks(data || []);
  }

  const handleUpdateTaskInState = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
      
      {/* Header General */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', color: '#2c3e50' }}>Gestor de Proyectos (Mini-Jira)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>
            Usuario: <strong>{session.user.email}</strong>
          </span>
          <button 
            onClick={() => supabase.auth.signOut()} 
            style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Selector y Creador de Proyectos */}
      <ProjectManager 
        selectedProject={selectedProject} 
        setSelectedProject={setSelectedProject} 
      />

      {/* Tablero Kanban estilo Jira */}
      <KanbanBoard 
        selectedProject={selectedProject}
        tasks={tasks}
        setTasks={setTasks}
        onOpenTaskDetail={(task) => setActiveTaskForModal(task)}
      />

      {/* Modal de Detalle de Tarea (Fechas y Comentarios) */}
      {activeTaskForModal && (
        <TaskModal 
          task={activeTaskForModal}
          onClose={() => setActiveTaskForModal(null)}
          onUpdateTask={handleUpdateTaskInState}
        />
      )}

    </div>
  );
}

export default App;