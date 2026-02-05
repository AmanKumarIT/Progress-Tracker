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
        'Marking as failure will auto-delete after 2 days. Continue?'
      )
    ) {
      return
    }

    await api.patch(`/tasks/${taskId}/`, { status })
    fetchTasks()
  }

  const addReminder = async (taskId) => {
    if (!reminderTime) {
      alert('Please select date & time')
      return
    }

    await api.post('/create-reminder/', {
      task: taskId,
      remind_at: reminderTime,
    })

    alert('Reminder set')
    setReminderTime('')
  }

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

      {/* Trello Board */}
      <div className="board">
        {CATEGORIES.map(col => (
          <div key={col.key} className="column">
            <h2 className="column-title">{col.label}</h2>

            {tasks
              .filter(t => t.category === col.key)
              .map(task => (
                <div
                  key={task.id}
                  className={`task-card ${task.status}`}
                >
                  <h3>{task.title}</h3>

                  <p>
                    Status: <b>{task.status}</b>
                  </p>

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

                  {/* History */}
                  <div className="history">
                    {task.history.map(h => (
                      <div key={h.id}>
                        {h.old_status} → {h.new_status}
                      </div>
                    ))}
                  </div>

                  {/* Reminder */}
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
                      ⏰
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
