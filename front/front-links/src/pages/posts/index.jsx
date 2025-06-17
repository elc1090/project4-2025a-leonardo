import './style.css';
import logohome from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function MeusPosts({ setLogado }) {
  const navigate = useNavigate();
  const [meusLinks, setMeusLinks] = useState([]);
  const [loading, setLoading] = useState(true); // ← NOVO

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

    async function carregarMeusLinks() {
      setLoading(true); // ← INÍCIO do loading
      try {
        const resposta = await axios.get('https://keepdance-backend.onrender.com/links');
        const meus = resposta.data.filter(link => link.usuarioId === userId);

        const linksComPreview = await Promise.all(
          meus.map(async (link) => {
            const imagem = await gerarPreview(link.url);
            return { ...link, imagem };
          })
        );

        setMeusLinks(linksComPreview);
      } catch (error) {
        console.error('Erro ao carregar meus links:', error);
      } finally {
        setLoading(false); // ← FIM do loading
      }
    }

    if (userId) carregarMeusLinks();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogado(false);
    navigate('/login');
  };

  const handleExcluir = async (linkId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://keepdance-backend.onrender.com/links/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeusLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (error) {
      console.error('Erro ao excluir link:', error);
    }
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
          <h2>Meus Posts</h2>
        </div>

        <div className="navbar-right">
          <button onClick={() => navigate('/')} className="green-button">Página Inicial</button>
          <button onClick={handleLogout} className="exit-button">Sair</button>
        </div>
      </header>

      <main className="main-content">
        <div className="main-box">
          {loading ? ( // ← Exibe o loading
            <div className="centralizar">
              Carregando...
              <div className="loading-spinner"></div>
            </div>
          ) : meusLinks.length === 0 ? (
            <p>Você ainda não adicionou nenhum link.</p>
          ) : (
            meusLinks.map(link => (
              <div key={link.id} className="card-link">
                {link.imagem && (
                  <img src={link.imagem} alt={link.titulo} className="card-image" />
                )}
                <h3>{link.titulo}</h3>
                <p><strong>Gênero:</strong> {link.genero}</p>
                <p><strong>Tipo:</strong> {link.tipo}</p>
                <a href={link.url} target="_blank" rel="noopener noreferrer">Ouvir agora</a>
                <div className="botoes-post">
                  <button className="edit-button" onClick={() => navigate(`/editar/${link.id}`)}>Editar</button>
                  <button className="red-button" onClick={() => handleExcluir(link.id)}>Excluir</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default MeusPosts;
