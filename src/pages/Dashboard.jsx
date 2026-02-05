import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const CATEGORIES = [
  { key: 'internship', label: 'Internships' },
  { key: 'project', label: 'Projects' },
  { key: 'hackathon', label: 'Hackathons' },
]

function Dashboard() {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('project')
  const [reminderTime, setReminderTime] = useState('')
  const [showFailed, setShowFailed] = useState(false)

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/')
      setTasks(res.data)
    } catch {
      navigate('/')
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/')
      return
    }
    fetchTasks()
  }, [])

  const createTask = async (e) => {
    e.preventDefault()
    if (!title) {
      alert('Title required')
      return
    }

    await api.post('/tasks/', {
      title,
      category,
      status: 'progress',
    })

    setTitle('')
    setCategory('project')
    fetchTasks()
  }

  const updateStatus = async (taskId, status) => {
    if (
      status === 'failure' &&
      !window.confirm(
        'This task will be moved to Failed Tasks and auto-deleted after 2 days. Continue?'
      )
    ) {
      return
    }

    await api.patch(`/tasks/${taskId}/`, { status })
    fetchTasks()
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this failed task permanently?')) return
    await api.delete(`/tasks/${taskId}/`)
    fetchTasks()
  }

  const activeTasks = tasks.filter(t => t.status !== 'failure')
  const failedTasks = tasks.filter(t => t.status === 'failure')

  return (
    <div className="container">
      <h1>Progress Tracker</h1>

      {/* Create Task */}
      <form onSubmit={createTask} className="card">
        <input
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>

        <button>Add Task</button>
      </form>

      {/* MAIN BOARD (NO FAILED TASKS) */}
      <div className="board">
        {CATEGORIES.map(col => (
          <div key={col.key} className="column">
            <h2 className="column-title">{col.label}</h2>

            {activeTasks
              .filter(t => t.category === col.key)
              .map(task => (
                <div
                  key={task.id}
                  className={`task-card ${task.status}`}
                >
                  <h3>{task.title}</h3>

                  <div className="actions">
                    <button
                      className="success"
                      onClick={() =>
                        updateStatus(task.id, 'success')
                      }
                    >
                      ✅
                    </button>

                    <button
                      className="fail"
                      onClick={() =>
                        updateStatus(task.id, 'failure')
                      }
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* FAILED TASKS TOGGLE */}
      <div className="failed-section">
        <button
          className="failed-toggle"
          onClick={() => setShowFailed(!showFailed)}
        >
          {showFailed
            ? 'Hide Failed Tasks'
            : `Show Failed Tasks (${failedTasks.length})`}
        </button>

        {showFailed && (
          <div className="failed-list">
            {failedTasks.length === 0 && (
              <p>No failed tasks 🎉</p>
            )}

            {failedTasks.map(task => (
              <div key={task.id} className="task-card failure">
                <h3>{task.title}</h3>
                <button
                  className="delete"
                  onClick={() => deleteTask(task.id)}
                >
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
