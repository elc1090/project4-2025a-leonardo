import './style.css'
import img1 from '../../assets/1.png'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login({ setLogado }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://keepdance-backend.onrender.com/login', { email, senha })
      localStorage.setItem('token', res.data.token)
      setLogado(true)
      navigate('/')
    } catch (err) {
      setErro('Email ou senha inválidos')
    }
  }

  // FUNÇÃO PARA INICIAR LOGIN COM GOOGLE
  const handleGoogleLogin = () => {
    window.location.href = 'https://keepdance-backend.onrender.com/auth/google'
  }

  // CHECA SE VEIO TOKEN NA URL (login Google)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('token', token)
      setLogado(true)
      navigate('/')
    }
  }, [navigate, setLogado])

  return (
    <div className="container">
      <img src={img1} alt="logo" className="logo" />
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <h1 className="title">Login</h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          name="senha"
          type="password"
          placeholder="Senha"
          className="input"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="button" className="button" onClick={handleLogin}>
          Entrar
        </button>

        {/* BOTÃO LOGIN GOOGLE */}
        <button
          type="button"
          className="button"
          style={{ backgroundColor: '#fff', color: '#444', border: '1px solid #888', marginTop: '10px' }}
          onClick={handleGoogleLogin}
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, marginRight: 8, verticalAlign: 'middle' }} />
          Entrar com Google
        </button>

        {erro && <p style={{ color: 'red', marginTop: '10px' }}>{erro}</p>}
      </form>
      <div className="conta">
        Não possui uma conta?
        <a href="/cadastro" className='logar'> Cadastrar-se</a>
      </div>
    </div>
  )
}

export default Login