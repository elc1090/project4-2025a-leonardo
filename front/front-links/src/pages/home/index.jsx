import './style.css';
import logohome from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Home({ setLogado }) {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);

  // Função para buscar preview da imagem via Microlink API
  async function gerarPreview(url) {
    try {
      const resposta = await axios.get('https://api.microlink.io', {
        params: { url }
      });
      const dados = resposta.data.data;
      return dados.image?.url || null; // retorna URL da imagem ou null
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      return null;
    }
  }

  useEffect(() => {
    async function carregarLinksComPreview() {
      try {
        const resposta = await axios.get('http://localhost:3000/links');
        const linksData = resposta.data;

        // Para cada link, buscar a imagem preview
        const linksComPreview = await Promise.all(
          linksData.map(async (link) => {
            const imagem = await gerarPreview(link.url);
            return { ...link, imagem };
          })
        );

        setLinks(linksComPreview);
      } catch (error) {
        console.error('Erro ao buscar links:', error);
      }
    }

    carregarLinksComPreview();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogado(false);
    navigate('/login');
  };

  return (
    <div className="home">
      <header className="header">
        <div className="navbar-left">
          <img src={logohome} alt="Logo" className="logohome" />
        </div>

        <div className="navbar-center">
          <input
            type="text"
            className="search-bar"
            placeholder="Search tracks, releases, artists, labels, and charts..."
          />
        </div>

        <div className="navbar-right">
          <button className='green-button' onClick={() => navigate('/adicionar')}>
            Adicionar streaming
          </button>
          <button onClick={handleLogout} className="exit-button">Sair</button>
        </div>
      </header>

      <div className="content">
        <aside className="sidebar">
          <nav>
            <a href="#">Página inicial</a>
            <a href="#">Curtidas</a>
          </nav>
        </aside>

        <main className="main-content">
          <div className="main-box">
            {links.length === 0 ? (
              <p>Nenhum link público ainda.</p>
            ) : (
              links.map(link => (
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
    </div>
  );
}

export default Home;
