import { useState } from 'react';
import { supabase } from '../supabaseClient';

function KanbanBoard({ selectedProject, tasks, setTasks, onOpenTaskDetail }) {
  const [newTaskText, setNewTaskText] = useState('');

  // Columnas fijas del tablero tipo Jira
  const columns = [
    { id: 'por_hacer', title: 'Tareas por hacer', bg: '#f1f2f6' },
    { id: 'en_curso', title: 'En curso', bg: '#e7f5ff' },
    { id: 'finalizada', title: 'Finalizada', bg: '#ebfbee' }
  ];

  // Crear una nueva tarea en el proyecto actual con estado "por_hacer" por defecto
  const handleCreateTask = async (e, status) => {
    e.preventDefault();
    if (!newTaskText.trim() || !selectedProject) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        texto: newTaskText, 
        status: status, 
        project_id: selectedProject.id,
        completed: status === 'finalizada' 
      }])
      .select();

    if (error) {
      console.error('Error al crear tarea:', error);
    } else if (data && data[0]) {
      setTasks([data[0], ...tasks]);
      setNewTaskText('');
    }
  };

  // Cambiar el estado de una tarjeta al moverla de columna
  const handleMoveTask = async (taskId, newStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: newStatus,
        completed: newStatus === 'finalizada' 
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error al mover tarea:', error);
    } else {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'finalizada' } : t));
    }
  };

  if (!selectedProject) {
    return <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>Selecciona o crea un proyecto arriba para ver su tablero.</p>;
  }

  return (
    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px' }}>
      {columns.map(col => {
        const columnTasks = tasks.filter(t => (t.status || 'por_hacer') === col.id);

        return (
          <div key={col.id} style={{ flex: '1', minWidth: '260px', background: col.bg, borderRadius: '8px', padding: '12px', border: '1px solid #dcdde1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#2f3640' }}>{col.title}</h4>
              <span style={{ background: '#ced6e0', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                {columnTasks.length}
              </span>
            </div>

            {/* Listado de tarjetas en esta columna */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '150px' }}>
              {columnTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => onOpenTaskDetail(task)}
                  style={{ background: '#fff', padding: '12px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer', border: '1px solid #ddd' }}
                >
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#333', fontWeight: '500' }}>{task.texto}</p>
                  
                  {/* Fechas si existen */}
                  {(task.start_date || task.due_date) && (
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', borderTop: '1px dashed #eee', paddingTop: '6px' }}>
                      {task.start_date && <div>Inicio: {task.start_date}</div>}
                      {task.due_date && <div>Vence: {task.due_date}</div>}
                    </div>
                  )}

                  {/* Botones rápidos para mover de columna */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginTop: '8px' }}>
                    <span style={{ color: '#007bff', fontWeight: 'bold' }}>#SIC-{task.id}</span>
                    <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                      {col.id !== 'por_hacer' && (
                        <button onClick={() => handleMoveTask(task.id, col.id === 'finalizada' ? 'en_curso' : 'por_hacer')} style={{ fontSize: '10px', padding: '2px 6px', cursor: 'pointer' }}>←</button>
                      )}
                      {col.id !== 'finalizada' && (
                        <button onClick={() => handleMoveTask(task.id, col.id === 'por_hacer' ? 'en_curso' : 'finalizada')} style={{ fontSize: '10px', padding: '2px 6px', cursor: 'pointer' }}>→</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulario rápido para agregar tarjeta en esta columna */}
            <form onSubmit={(e) => handleCreateTask(e, col.id)} style={{ marginTop: '12px', display: 'flex', gap: '5px' }}>
              <input 
                type="text" 
                placeholder="+ Crear tarjeta..." 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </form>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;