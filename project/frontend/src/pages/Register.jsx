import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { register, reset } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  })

  const { name, email, password, password2 } = formData
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

    if (password !== password2) {
      toast.error('Passwords do not match')
      return
    }

    dispatch(register({ name, email, password }))
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
          <p className='eyebrow'>Create account</p>
          <h1>Start a team workspace</h1>
        </div>
        <form className='auth-form' onSubmit={onSubmit}>
          <label>
            Name
            <input type='text' name='name' value={name} onChange={onChange} />
          </label>
          <label>
            Email
            <input type='email' name='email' value={email} onChange={onChange} />
          </label>
          <label>
            Password
            <input
              type='password'
              name='password'
              value={password}
              onChange={onChange}
            />
          </label>
          <label>
            Confirm password
            <input
              type='password'
              name='password2'
              value={password2}
              onChange={onChange}
            />
          </label>
          <button type='submit' className='primary-button full-width'>
            Create account
          </button>
        </form>
        <p className='auth-switch'>
          Already have an account? <Link to='/login'>Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
