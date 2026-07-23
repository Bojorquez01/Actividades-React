import React from 'react';

function TaskForm({ inputTask, setInputTask, handleAddTask }) {
  return (
    <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <input 
        type="text" 
        value={inputTask} 
        onChange={(e) => setInputTask(e.target.value)} 
        placeholder="Escribe una nueva tarea..."
        style={{ flex: 1, padding: '8px' }}
      />
      <button type="submit" style={{ padding: '8px 16px' }}>Agregar</button>
    </form>
  );
}

export default TaskForm;