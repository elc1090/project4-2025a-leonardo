import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/login';
import Home from './pages/home';
import Cadastro from './pages/cadastro';
import Adicionar from './pages/adicionar';
import Curtidas from './pages/curtidas';
import MeusPosts from './pages/posts';
import EditarPost from './pages/editar';
import Sugestoes from './pages/sugestoes';

function App() {
  const [logado, setLogado] = useState(null); // null = ainda checando

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLogado(!!token);
  }, []);

  if (logado === null) {
    return <div>Carregando...</div>; // ou use um spinner bonito
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={logado ? <Navigate to="/" /> : <Login setLogado={setLogado} />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/" element={logado ? <Home setLogado={setLogado} /> : <Navigate to="/login" />} />
        <Route path="/adicionar" element={logado ? <Adicionar /> : <Navigate to="/login" />} />
        <Route path="/curtidas" element={logado ? <Curtidas setLogado={setLogado} /> : <Navigate to="/login" />} />
        <Route path="/meus-posts" element={logado ? <MeusPosts setLogado={setLogado} /> : <Navigate to="/login" />} />
        <Route path="/editar/:id" element={<EditarPost />} />
        <Route path="/sugestoes" element={logado ? <Sugestoes setLogado={setLogado} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
