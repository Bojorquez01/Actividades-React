import { useState } from 'react';
import { supabase } from '../supabaseClient';

function TaskModal({ task, onClose, onUpdateTask }) {
  const [startDate, setStartDate] = useState(task.start_date || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [comments, setComments] = useState(task.comments || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('tasks')
      .update({
        start_date: startDate || null,
        due_date: dueDate || null,
        comments: comments
      })
      .eq('id', task.id);

    if (error) {
      console.error('Error al actualizar detalles de la tarea:', error);
    } else {
      onUpdateTask({
        ...task,
        start_date: startDate || null,
        due_date: dueDate || null,
        comments: comments
      });
      onClose();
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '400px', maxWidth: '90%', fontFamily: 'sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Detalles de Tarjeta: #SIC-{task.id}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>

        <p style={{ fontSize: '14px', background: '#f8f9fa', padding: '10px', borderRadius: '4px', border: '1px solid #e9ecef', marginTop: 0 }}>
          <strong>Tarea:</strong> {task.texto}
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Fecha de inicio:</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Fecha de fin:</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Comentarios / Notas:</label>
            <textarea 
              placeholder="Agrega comentarios o detalles sobre esta tarea..." 
              value={comments} 
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 14px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ padding: '8px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default TaskModal;