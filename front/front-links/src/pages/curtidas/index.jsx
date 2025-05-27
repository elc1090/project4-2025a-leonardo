import './style.css';
import logohome from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Curtidas({ setLogado }) {
  const navigate = useNavigate();
  const [linksCurtidos, setLinksCurtidos] = useState([]);

  function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      return payload.id;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  const userId = getUserIdFromToken();

  useEffect(() => {
    async function gerarPreview(url) {
      try {
        const resposta = await axios.get('https://api.microlink.io', {
          params: { url }
        });
        const dados = resposta.data.data;
        return dados.image?.url || null;
      } catch (error) {
        console.error('Erro ao gerar preview:', error);
        return null;
      }
    }
  
    async function carregarLinksCurtidos() {
      try {
        const token = localStorage.getItem('token');
        const resposta = await axios.get('http://localhost:3000/links', {
          params: { usuarioId: userId },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        const curtidos = resposta.data.filter(link => link.curtido);
  

        const curtidosComPreview = await Promise.all(
          curtidos.map(async (link) => {
            const imagem = await gerarPreview(link.url);
            return { ...link, imagem };
          })
        );
  
        setLinksCurtidos(curtidosComPreview);
      } catch (error) {
        console.error('Erro ao buscar links curtidos:', error);
      }
    }
  
    if (userId) carregarLinksCurtidos();
  }, [userId]);
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogado(false);
    navigate('/login');
  };

  return (
    <div className="home">
      <header className="header">
        <div className="navbar-left">
          <a href="/">
          <img src={logohome} alt="Logo" className="logohome" />
          </a>
        </div>

        <div className="navbar-center">
          <h2>Links Curtidos</h2>
        </div>

        <div className="navbar-right">
          <button onClick={() => navigate('/')} className="green-button">
            Página Inicial
          </button>
          <button onClick={handleLogout} className="exit-button">Sair</button>
        </div>
      </header>

      <main className="main-content">
        <div className="main-box">
          {linksCurtidos.length === 0 ? (
            <p>Você ainda não curtiu nenhum streaming.</p>
          ) : (
            linksCurtidos.map(link => (
              <div key={link.id} className="card-link">
                {link.imagem && (
                  <img src={link.imagem} alt={link.titulo} className="card-image" />
                )}
                <h3>{link.titulo}</h3>
                <p><strong>Gênero:</strong> {link.genero}</p>
                <p><strong>Tipo:</strong> {link.tipo}</p>
                <a href={link.url} target="_blank" rel="noopener noreferrer">Ouvir agora</a>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Curtidas;
