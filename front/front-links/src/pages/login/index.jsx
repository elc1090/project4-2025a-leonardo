import './style.css'
import img1 from '../../assets/1.png'
import { useState } from 'react'
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

        {erro && <p style={{ color: 'red', marginTop: '10px' }}>{erro}</p>}
      </form>
      <div className="conta">
      Não possui uma conta?
      <a href="/cadastro" className='logar'> Cadastrar-se</a></div>
    </div>
  )
}

export default Login
