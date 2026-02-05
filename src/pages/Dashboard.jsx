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
  const [targetDate, setTargetDate] = useState('')
  const [showFailed, setShowFailed] = useState(false)

  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editData, setEditData] = useState({})

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

  // CREATE TASK
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
      target_date: targetDate || null,
      status: 'progress',
    })

    setTitle('')
    setDescription('')
    setCategory('project')
    setTargetDate('')
    fetchTasks()
  }

  // UPDATE STATUS
  const updateStatus = async (taskId, status) => {
    if (
      status === 'failure' &&
      !window.confirm(
        'This task will move to Failed Tasks. Continue?'
      )
    ) {
      return
    }

    await api.patch(`/tasks/${taskId}/`, { status })
    fetchTasks()
  }

  // START EDIT
  const startEdit = (task) => {
    setEditingTaskId(task.id)
    setEditData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      target_date: task.target_date
        ? task.target_date.slice(0, 16)
        : '',
    })
  }

  // SAVE EDIT
  const saveEdit = async (taskId) => {
    await api.patch(`/tasks/${taskId}/`, {
      ...editData,
      target_date: editData.target_date || null,
    })

    setEditingTaskId(null)
    setEditData({})
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
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
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

        <input
          type="datetime-local"
          value={targetDate}
          onChange={e => setTargetDate(e.target.value)}
        />

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
                  {editingTaskId === task.id ? (
                    <>
                      <input
                        value={editData.title}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            title: e.target.value,
                          })
                        }
                      />

                      <textarea
                        value={editData.description}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                      />

                      <select
                        value={editData.category}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            category: e.target.value,
                          })
                        }
                      >
                        {CATEGORIES.map(c => (
                          <option
                            key={c.key}
                            value={c.key}
                          >
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="datetime-local"
                        value={editData.target_date}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            target_date: e.target.value,
                          })
                        }
                      />

                      <button onClick={() => saveEdit(task.id)}>
                        💾 Save
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>{task.title}</h3>

                      {task.description && (
                        <p>{task.description}</p>
                      )}

                      {task.target_date && (
                        <p>
                          🎯{' '}
                          {new Date(
                            task.target_date
                          ).toLocaleString()}
                        </p>
                      )}

                      {task.reminders &&
                        task.reminders.length > 0 && (
                          <p>
                            ⏰{' '}
                            {new Date(
                              task.reminders[0].remind_at
                            ).toLocaleString()}
                          </p>
                        )}

                      <div className="actions">
                        <button
                          onClick={() =>
                            updateStatus(task.id, 'success')
                          }
                        >
                          ✅
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(task.id, 'failure')
                          }
                        >
                          ❌
                        </button>

                        <button
                          onClick={() => startEdit(task)}
                        >
                          ✏️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* FAILED TASKS */}
      <div className="failed-section">
        <button
          onClick={() => setShowFailed(!showFailed)}
        >
          {showFailed
            ? 'Hide Failed Tasks'
            : `Show Failed Tasks (${failedTasks.length})`}
        </button>

        {showFailed &&
          failedTasks.map(task => (
            <div
              key={task.id}
              className="task-card failure"
            >
              <h3>{task.title}</h3>

              {task.description && (
                <p>{task.description}</p>
              )}

              {task.target_date && (
                <p>
                  🎯{' '}
                  {new Date(
                    task.target_date
                  ).toLocaleString()}
                </p>
              )}

              {task.reminders &&
                task.reminders.length > 0 && (
                  <p>
                    ⏰{' '}
                    {new Date(
                      task.reminders[0].remind_at
                    ).toLocaleString()}
                  </p>
                )}
            </div>
          ))}
      </div>
    </div>
  )
}

export default Dashboard
