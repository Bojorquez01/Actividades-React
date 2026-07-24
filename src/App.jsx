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
    <div style={{ maxWidth: '1200px', margin: '20px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      
      {/* Header General */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '15px 20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#2c3e50' }}>Gestor de Proyectos</h2>
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

      {/* Si no hay proyecto seleccionado, mostramos la pantalla de proyectos. Si hay uno, mostramos el Kanban */}
      {!selectedProject ? (
        <ProjectManager onSelectProject={(proj) => setSelectedProject(proj)} />
      ) : (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <KanbanBoard 
            selectedProject={selectedProject}
            tasks={tasks}
            setTasks={setTasks}
            onOpenTaskDetail={(task) => setActiveTaskForModal(task)}
            onBackToProjects={() => setSelectedProject(null)}
          />
        </div>
      )}

      {/* Modal de Detalle de Tarea */}
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