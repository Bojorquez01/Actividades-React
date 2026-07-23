import React from 'react';

function TaskList({ tasks, handleDeleteTask, handleToggleComplete }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map(task => (
        <li 
          key={task.id} 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '10px', 
            background: task.completed ? '#e0ffe0' : '#f9f9f9',
            padding: '10px', 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          
          <span 
            style={{ 
              textDecoration: task.completed ? 'line-through' : 'none', 
              color: task.completed ? '#888' : '#000',
              flex: 1,
              wordBreak: 'break-word'
            }}
          >
            {task.texto}
          </span>

          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => handleToggleComplete(task.id, task.completed)}
              style={{ 
                background: task.completed ? '#ffc107' : '#28a745', 
                color: '#fff', 
                border: 'none', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              {task.completed ? 'Desmarcar' : 'Completar'}
            </button>

            <button 
              onClick={() => handleDeleteTask(task.id)} 
              style={{ 
                background: '#dc3545', 
                color: '#fff', 
                border: 'none', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Borrar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;