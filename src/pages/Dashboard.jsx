import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Dashboard() {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [showFailed, setShowFailed] = useState(false)

  // Fetch tasks
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

  // Create task
  const createTask = async (e) => {
    e.preventDefault()
    if (!title || !category) {
      alert('Title and category required')
      return
    }

    await api.post('/tasks/', {
      title,
      category,
      status: 'PENDING'
    })

    setTitle('')
    setCategory('')
    fetchTasks()
  }

  // Update task status
  const updateStatus = async (taskId, status) => {
    const confirmFail =
      status === 'FAILED'
        ? window.confirm(
            'Are you sure? This task will move to Failed Tasks and be deleted after 2 days.'
          )
        : true

    if (!confirmFail) return

    await api.patch(`/tasks/${taskId}/`, { status })
    fetchTasks()
  }

  // Add reminder
  const addReminder = async (taskId) => {
    if (!reminderTime) {
      alert('Please select date & time')
      return
    }

    await api.post('/reminders/', {
      task: taskId,
      remind_at: reminderTime
    })

    alert('Reminder set')
    setReminderTime('')
  }

  // Filter tasks
  const visibleTasks = tasks.filter(task =>
    showFailed ? task.status === 'FAILED' : task.status !== 'FAILED'
  )

  return (
    <div className="container">
      <h1>Progress Tracker</h1>

      {/* Toggle */}
      <button onClick={() => setShowFailed(!showFailed)}>
        {showFailed ? 'Show Active Tasks' : 'Show Failed Tasks'}
      </button>

      {/* Create Task */}
      {!showFailed && (
        <form onSubmit={createTask} className="card">
          <input
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
          <button>Add Task</button>
        </form>
      )}

      {/* Task List */}
      {visibleTasks.length === 0 && (
        <p>{showFailed ? 'No failed tasks.' : 'No active tasks.'}</p>
      )}

      {visibleTasks.map(task => (
        <div key={task.id} className="card">
          <h3>{task.title}</h3>
          <p>{task.category}</p>
          <p>
            Status: <b>{task.status}</b>
          </p>

          {!showFailed && (
            <>
              <button
                className="success"
                onClick={() => updateStatus(task.id, 'SUCCESS')}
              >
                Mark Success
              </button>

              <button
                className="fail"
                onClick={() => updateStatus(task.id, 'FAILED')}
              >
                Mark Failed
              </button>
            </>
          )}

          {/* History */}
          <h4>History</h4>
          {task.history.length === 0 && <p>No history yet</p>}
          {task.history.map(h => (
            <p key={h.id}>
              {h.old_status} → {h.new_status}
            </p>
          ))}

          {/* Reminder */}
          {!showFailed && (
            <div>
              <input
                type="datetime-local"
                onChange={e => setReminderTime(e.target.value)}
              />
              <button
                className="reminder"
                onClick={() => addReminder(task.id)}
              >
                Set Reminder
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Dashboard
