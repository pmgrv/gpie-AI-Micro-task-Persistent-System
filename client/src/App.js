import React from 'react';
import ChakraDashboard from './components/ChakraDashboard';
import { useTasks } from './hooks/useTasks';
function App() {
  const { stats } = useTasks();
  const [tasks, setTasks] = React.useState([]);
  const [selectedTask, setSelectedTask] = React.useState(null);
  
  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks/list');
      const data = await res.json();

      setTasks(data);

      if (data.length > 0) {
        setSelectedTask(prev => prev || data[0].id);
      }
    } catch (err) {
      console.error("AI Loader Error:", err.message);
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, []);
  // API Calls
  const handlePrice = async () => {
    const res = await fetch('http://localhost:5000/api/tasks/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: selectedTask, amount: 100, parentId: 2 })
    });
    if (!res.ok) {
      alert('Action failed');
      return;
    }
    alert('Task priced by Parent');
    await fetchTasks();
  };

  const handleSubmit = async () => {
    const res = await fetch('http://localhost:5000/api/tasks/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: selectedTask,
        childId: 3,
        answer: 'correct answer',
        duration: 10
      })
    });
    if (!res.ok) {
      alert('Action failed');
      return;
    }
    alert('Work submitted by Child');
    await fetchTasks();
  };

  const handleReview = async () => {
    const res = await fetch('http://localhost:5000/api/tasks/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: selectedTask, reviewerId: 4 })
    });
    if (!res.ok) {
      alert('Action failed');
      return;
    }
    alert('Task reviewed & rewards processed');
    await fetchTasks();
  };
  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ textAlign: 'center' }}>
        <h1>Sudarshan Chakra 365</h1>
        <p>AI-Driven Micro-Task Ecosystem</p>
      </header>

      <main style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <ChakraDashboard stats={stats} />
      </main>
      <div style={{ marginBottom: '20px' }}>
        {tasks.length === 0 ? (
          <p>No tasks available</p>
        ) : (
          <select 
            value={selectedTask} 
            onChange={(e) => setSelectedTask(Number(e.target.value))}
          >
            {tasks.map(task => (
              <option key={task.id} value={task.id}>
                Day {task.day_number} - {task.status}
              </option>
            ))}
          </select>
        )}
      </div>
      {/* ✅ ACTION PANEL (PUT HERE) */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        
        <h3>Simulate Flow</h3>

        <button disabled={!selectedTask} onClick={handlePrice} style={{ margin: '10px' }}>
          Parent: Price Task
        </button>

        <button disabled={!selectedTask} onClick={handleSubmit} style={{ margin: '10px' }}>
          Child: Submit Work
        </button>

        <button disabled={!selectedTask} onClick={handleReview} style={{ margin: '10px' }}>
          Reviewer: Validate
        </button>

      </div>

    </div>
  );
}

export default App;