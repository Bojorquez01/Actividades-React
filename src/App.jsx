import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputTask, setInputTask] = useState('');

  // 1. Cargar las tareas desde Supabase al iniciar la aplicación
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.error('Error al obtener tareas:', error);
    else setTasks(data || []);
  }

  // 2. Agregar una tarea guardándola en la base de datos
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

  // 3. Alternar el estado completed (completado/pendiente) en la base de datos
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

  // 4. Eliminar una tarea de la base de datos
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

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Gestor con Base de Datos (Supabase)</h2>
      
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