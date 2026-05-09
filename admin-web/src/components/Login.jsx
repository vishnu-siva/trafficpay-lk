import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login(username, password)
      if (data.role !== 'ROLE_ADMIN') {
        setError('Access denied. Admin credentials required.')
        return
      }
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_username', data.username)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span style={{ fontSize: '3rem' }}>🚔</span>
          <h1>Sri Lanka Police</h1>
          <p>Traffic Fine Administration Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Username</label>
            <input className="input" type="text" value={username}
              onChange={e => setUsername(e.target.value)} placeholder="admin" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="login-hint">Default: admin / admin123</p>
      </div>
    </div>
  )
}
