import './style.css';
import logohome from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import like from '../../assets/coracao_cheio.png';
import deslike from '../../assets/coracao_vazio.png';

function Home({ setLogado }) {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

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
      setLoading(true);
      try {
        const resposta = await axios.get('https://keepdance-backend.onrender.com/links', {
          params: { usuarioId: userId }
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
      } finally {
        setLoading(false);
      }
    }

    if (userId) carregarLinksComPreview();
  }, [userId]);

  // Reseta a página atual para 1 quando busca ou lista mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, links]);

  const linksFiltrados = links.filter(link =>
    link.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    link.genero.toLowerCase().includes(busca.toLowerCase()) ||
    link.tipo.toLowerCase().includes(busca.toLowerCase())
  );

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const linksPaginaAtual = linksFiltrados.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.ceil(linksFiltrados.length / itensPorPagina);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogado(false);
    navigate('/login');
  };

  async function handleCurtir(link) {
    const token = localStorage.getItem('token');
    const method = link.curtido ? 'delete' : 'post';

    try {
      await axios({
        method,
        url: 'https://keepdance-backend.onrender.com/favoritos',
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
            <a href="/meus-posts">Meus streamings</a>
            <a href="/sugestoes">Sugestões com IA</a>
          </nav>
        </aside>

        <main className="main-content">
          <div className="main-box">
            {loading ? (
              <div className="centralizar">
                Carregando...
                <div className="loading-spinner"></div>
              </div>
            ) : linksFiltrados.length === 0 ? (
              <p>Nenhum link encontrado.</p>
            ) : (
              <>
                {linksPaginaAtual.map(link => (
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
                        <img src={like} alt="Curtido" className='coracao_cheio' />
                      ) : (
                        <img src={deslike} alt="Não curtido" className='coracao_vazio' />
                      )}
                    </button>
                    <p><strong>Adicionado por:</strong> {link.usuario?.nomeUsuario || 'Desconhecido'}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">Ouvir agora</a>
                  </div>
                ))}

                <div className="paginacao">
  <button
    onClick={() => setPaginaAtual(pagina => Math.max(pagina - 1, 1))}
    disabled={paginaAtual === 1}
    aria-label="Página anterior"
  >
    &lt;
  </button>

  {[...Array(totalPaginas)].map((_, i) => {
    const numero = i + 1;
    return (
      <button
        key={numero}
        onClick={() => setPaginaAtual(numero)}
        className={paginaAtual === numero ? 'active' : ''}
        aria-current={paginaAtual === numero ? 'page' : undefined}
      >
        {numero}
      </button>
    );
  })}

  <button
    onClick={() => setPaginaAtual(pagina => Math.min(pagina + 1, totalPaginas))}
    disabled={paginaAtual === totalPaginas}
    aria-label="Próxima página"
  >
    &gt;
  </button>
</div>

              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
