import './style.css';
import img1 from '../../assets/1.png';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async () => {
    try {
      await axios.post('http://localhost:3000/usuarios', {
        nomeUsuario: nome,
        email,
        senha,
      });
      // Se der certo, redireciona para login
      navigate('/login');
    } catch (error) {
      setErro('Erro ao cadastrar. Pode existir um usuário com esses dados. Verifique e tente novamente.');
    }
  };

  return (
    <div className="container">
      <img src={img1} alt="logo" className="logo" />
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleCadastro();
        }}
      >
        <h1 className="title">Cadastro</h1>

        <input
          name="nome"
          type="text"
          placeholder="Nome"
          className="input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
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

        <button type="submit" className="button">
          Cadastrar
        </button>

        {erro && <p style={{ color: 'red', marginTop: '10px' }}>{erro}</p>}
      </form>
    </div>
  );
}

export default Cadastro;
