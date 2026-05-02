import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { login, reset } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'

function Login() {
  const [formData, setFormData] = useState({
    email: 'ava@sprinthub.dev',
    password: 'password123',
  })

  const { email, password } = formData
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess || user) {
      navigate('/')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    dispatch(login({ email, password }))
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <main className='auth-page'>
      <section className='auth-panel'>
        <div className='brand auth-brand'>
          <div className='brand-mark'>S</div>
          <div>
            <strong>SprintHub</strong>
            <span>Portfolio collaboration platform</span>
          </div>
        </div>
        <div className='auth-heading'>
          <p className='eyebrow'>Welcome back</p>
          <h1>Sign in to your workspace</h1>
        </div>
        <form className='auth-form' onSubmit={onSubmit}>
          <label>
            Email
            <input
              type='email'
              id='email'
              name='email'
              value={email}
              onChange={onChange}
            />
          </label>
          <label>
            Password
            <input
              type='password'
              id='password'
              name='password'
              value={password}
              onChange={onChange}
            />
          </label>
          <button type='submit' className='primary-button full-width'>
            Sign in
          </button>
        </form>
        <p className='auth-switch'>
          New here? <Link to='/register'>Create an account</Link>
        </p>
        <div className='demo-credentials'>
          <strong>Demo accounts</strong>
          <span>Owner: ava@sprinthub.dev / password123</span>
          <span>Member: noah@sprinthub.dev / password123</span>
        </div>
      </section>
    </main>
  )
}

export default Login
