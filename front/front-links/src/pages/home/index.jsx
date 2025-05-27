import './style.css';
import logohome from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Home({ setLogado }) {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [busca, setBusca] = useState('');

  // Decodifica o token para pegar userId
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

  useEffect(() => {
    async function carregarLinksComPreview() {
      try {
        const resposta = await axios.get('http://localhost:3000/links', {
          params: { usuarioId: userId }  // passar o id para marcar os curtidos
        });
        const linksData = resposta.data;

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

    if (userId) carregarLinksComPreview();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogado(false);
    navigate('/login');
  };

  const linksFiltrados = links.filter(link =>
    link.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    link.genero.toLowerCase().includes(busca.toLowerCase()) ||
    link.tipo.toLowerCase().includes(busca.toLowerCase())
  );

  async function handleCurtir(link) {
    const token = localStorage.getItem('token');
    const method = link.curtido ? 'delete' : 'post';

    try {
      await axios({
        method,
        url: 'http://localhost:3000/favoritos',
        data: { linkId: link.id },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLinks(prevLinks =>
        prevLinks.map(l =>
          l.id === link.id ? { ...l, curtido: !link.curtido } : l
        )
      );
    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error);
    }
  }

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
            placeholder="Pesquise por tracks, gêneros, artistas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
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
            <a href="/curtidas">Curtidas</a>
          </nav>
        </aside>

        <main className="main-content">
          <div className="main-box">
            {linksFiltrados.length === 0 ? (
              <p>Nenhum link encontrado.</p>
            ) : (
              linksFiltrados.map(link => (
                <div key={link.id} className="card-link">
                  {link.imagem && (
                    <img src={link.imagem} alt={link.titulo} className="card-image" />
                  )}
                  <h3>{link.titulo}</h3>
                  <p><strong>Gênero:</strong> {link.genero}</p>
                  <p><strong>Tipo:</strong> {link.tipo}</p>
                  <button
                  className={`like-button ${link.curtido ? 'curtido' : ''}`}
                  onClick={() => handleCurtir(link)}
                >
                  {link.curtido ? (
                    <img src="/src/assets/coracao_cheio.png" alt="Curtido" className='coracao_cheio' />
                  ) : (
                    <img src="/src/assets/coracao_vazio.png" alt="Não curtido" className='coracao_vazio'/>
                  )}
                </button>

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
