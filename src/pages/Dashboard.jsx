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
  const [description, setDescription] = useState('')
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
      description,
      category,
      status: 'progress',
    })

    setTitle('')
    setDescription('')
    setCategory('project')
    fetchTasks()
  }

  const updateStatus = async (taskId, status) => {
    if (
      status === 'failure' &&
      !window.confirm(
        'This task will move to Failed Tasks and auto-delete after 2 days. Continue?'
      )
    ) {
      return
    }

    await api.patch(`/tasks/${taskId}/`, { status })
    fetchTasks()
  }

  const addReminder = async (taskId) => {
    if (!reminderTime) {
      alert('Please select reminder date & time')
      return
    }

    await api.post('/create-reminder/', {
      task: taskId,
      remind_at: reminderTime,
    })

    alert('Reminder set')
    setReminderTime('')
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

      {/* CREATE TASK */}
      <form onSubmit={createTask} className="card">
        <input
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Task description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows="3"
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

      {/* MAIN BOARD */}
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

                  {task.description && (
                    <p className="description">{task.description}</p>
                  )}

                  {/* TARGET DATE */}
                  {task.target_date && (
                    <p className="date">
                      🎯 {new Date(task.target_date).toLocaleString()}
                    </p>
                  )}

                  {/* ACTIONS */}
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

                  {/* REMINDER */}
                  <div className="reminder-box">
                    <input
                      type="datetime-local"
                      onChange={e =>
                        setReminderTime(e.target.value)
                      }
                    />
                    <button
                      className="reminder"
                      onClick={() =>
                        addReminder(task.id)
                      }
                    >
                      ⏰ Set Reminder
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* FAILED TASKS */}
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
            {failedTasks.map(task => (
              <div key={task.id} className="task-card failure">
                <h3>{task.title}</h3>

                {task.description && (
                  <p className="description">{task.description}</p>
                )}

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
