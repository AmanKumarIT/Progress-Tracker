import { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await api.post('/token/', {
        username,
        password,
      })

      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)

      navigate('/dashboard')
    } catch (err) {
      alert('Invalid credentials')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Progress Tracker</h2>
        <p className="login-subtitle">
          Track. Improve. Succeed.
        </p>

        <form onSubmit={handleLogin}>
          <input
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-button" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
