import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Auth from './components/Auth';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [inputTask, setInputTask] = useState('');

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
    if (session) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [session]);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.error('Error al obtener tareas:', error);
    else setTasks(data || []);
  }

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (inputTask.trim() === '') return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ texto: inputTask, completed: false }])
      .select();

    if (error) {
      console.error('Error al agregar tarea:', error);
    } else if (data) {
      setTasks([data[0], ...tasks]);
      setInputTask('');
    }
  };

  const handleToggleComplete = async (id, currentCompleted) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !currentCompleted })
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar tarea:', error);
    } else {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !currentCompleted } : task
      ));
    }
  };

  const handleDeleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al borrar tarea:', error);
    } else {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Mis Actividades</h2>
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          Cerrar sesión
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
        Conectado como: <strong>{session.user.email}</strong>
      </p>
      
      <TaskForm 
        inputTask={inputTask} 
        setInputTask={setInputTask} 
        handleAddTask={handleAddTask} 
      />
      
      <TaskList 
        tasks={tasks} 
        handleDeleteTask={handleDeleteTask} 
        handleToggleComplete={handleToggleComplete}
      />
    </div>
  );
}

export default App;