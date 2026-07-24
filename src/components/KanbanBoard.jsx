import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function KanbanBoard({ selectedProject, tasks, setTasks, onOpenTaskDetail, onBackToProjects }) {
  const [columns, setColumns] = useState([]);
  const [inputTexts, setInputTexts] = useState({}); // Input independiente por cada columna
  const [newColTitle, setNewColTitle] = useState('');
  const [showAddCol, setShowAddCol] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      fetchColumns();
    }
  }, [selectedProject]);

  async function fetchColumns() {
    const { data, error } = await supabase
      .from('project_columns')
      .select('*')
      .eq('project_id', selectedProject.id)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error al cargar columnas:', error);
    } else if (data && data.length > 0) {
      setColumns(data);
    } else {
      // Si el proyecto no tiene columnas creadas, creamos las 3 por defecto por primera vez
      const defaultCols = [
        { project_id: selectedProject.id, column_key: 'por_hacer', title: 'Tareas por hacer', bg_color: '#f1f2f6', position: 1 },
        { project_id: selectedProject.id, column_key: 'en_curso', title: 'En curso', bg_color: '#e7f5ff', position: 2 },
        { project_id: selectedProject.id, column_key: 'finalizada', title: 'Finalizada', bg_color: '#ebfbee', position: 3 }
      ];
      const { data: inserted, error: insError } = await supabase
        .from('project_columns')
        .insert(defaultCols)
        .select();
      
      if (!insError) setColumns(inserted);
    }
  }

  // Crear nueva tarea con contador independiente y prefijo basado en el nombre del proyecto
  const handleCreateTask = async (e, colKey) => {
    e.preventDefault();
    const text = inputTexts[colKey];
    if (!text || !text.trim()) return;

    // Calcular el siguiente número de tarea para este proyecto
    const projectTasks = tasks.filter(t => t.project_id === selectedProject.id);
    const nextNumber = projectTasks.length > 0 ? Math.max(...projectTasks.map(t => t.task_number || 0)) + 1 : 1;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        texto: text, 
        status: colKey, 
        project_id: selectedProject.id,
        completed: colKey === 'finalizada',
        task_number: nextNumber
      }])
      .select();

    if (error) {
      console.error('Error al crear tarea:', error);
    } else if (data && data[0]) {
      setTasks([data[0], ...tasks]);
      setInputTexts({ ...inputTexts, [colKey]: '' }); // Limpiar solo el input de esta columna
    }
  };

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

  // Agregar una nueva columna personalizada al proyecto
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;

    const colKey = newColTitle.toLowerCase().replace(/\s+/g, '_');
    const newPos = columns.length + 1;

    const { data, error } = await supabase
      .from('project_columns')
      .insert([{
        project_id: selectedProject.id,
        column_key: colKey,
        title: newColTitle,
        bg_color: '#fff3cd',
        position: newPos
      }])
      .select();

    if (!error && data) {
      setColumns([...columns, data[0]]);
      setNewColTitle('');
      setShowAddCol(false);
    }
  };

  // Obtener iniciales o prefijo limpio del nombre del proyecto (Ej: "REACT" -> "REACT", "SICOESC" -> "SIC")
  const getProjectPrefix = (name) => {
    if (!name) return 'PRJ';
    return name.toUpperCase().replace(/\s+/g, '').substring(0, 5);
  };

  return (
    <div>
      {/* Barra superior del tablero */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', background: '#f8f9fa', padding: '10px 15px', borderRadius: '6px' }}>
        <button 
          onClick={onBackToProjects}
          style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
        >
          ← Volver a Proyectos
        </button>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>Proyecto: {selectedProject.name}</h3>
        <button 
          onClick={() => setShowAddCol(!showAddCol)}
          style={{ background: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
        >
          {showAddCol ? 'Cancelar' : '+ Agregar columna'}
        </button>
      </div>

      {/* Formulario para agregar columna */}
      {showAddCol && (
        <form onSubmit={handleAddColumn} style={{ display: 'flex', gap: '10px', marginBottom: '15px', background: '#e9ecef', padding: '10px', borderRadius: '6px' }}>
          <input 
            type="text" 
            placeholder="Título de la nueva columna..." 
            value={newColTitle}
            onChange={(e) => setNewColTitle(e.target.value)}
            style={{ padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
          <button type="submit" style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Guardar Columna
          </button>
        </form>
      )}

      {/* Columnas del Tablero */}
      <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px' }}>
        {columns.map(col => {
          const columnTasks = tasks.filter(t => (t.status || 'por_hacer') === col.column_key);

          return (
            <div key={col.id} style={{ flex: '1', minWidth: '260px', background: col.bg_color || '#f1f2f6', borderRadius: '8px', padding: '12px', border: '1px solid #dcdde1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: '#2f3640' }}>{col.title}</h4>
                <span style={{ background: '#ced6e0', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Tarjetas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '150px' }}>
                {columnTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => onOpenTaskDetail(task)}
                    style={{ background: '#fff', padding: '12px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer', border: '1px solid #ddd' }}
                  >
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#333', fontWeight: '500' }}>{task.texto}</p>
                    
                    {(task.start_date || task.due_date) && (
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', borderTop: '1px dashed #eee', paddingTop: '6px' }}>
                        {task.start_date && <div>Inicio: {task.start_date}</div>}
                        {task.due_date && <div>Vence: {task.due_date}</div>}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginTop: '8px' }}>
                      <span style={{ color: '#007bff', fontWeight: 'bold' }}>
                        #{getProjectPrefix(selectedProject.name)}-{task.task_number || task.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input independiente por columna */}
              <div style={{ marginTop: '12px' }}>
                <input 
                  type="text" 
                  placeholder="+ Crear tarjeta..." 
                  value={inputTexts[col.column_key] || ''}
                  onChange={(e) => setInputTexts({ ...inputTexts, [col.column_key]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTask(e, col.column_key);
                  }}
                  style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KanbanBoard;