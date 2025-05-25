import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Home from './pages/home'
import Cadastro from './pages/cadastro' 
import Adicionar from './pages/adicionar'
import { useEffect, useState } from 'react'

function App() {
  const [logado, setLogado] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setLogado(!!token)
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={logado ? <Navigate to="/" /> : <Login setLogado={setLogado} />} />
        <Route path="/" element={logado ? <Home setLogado={setLogado} /> : <Navigate to="/login" />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/adicionar" element={<Adicionar />} />
      </Routes>
    </Router>
  )
}

export default App
