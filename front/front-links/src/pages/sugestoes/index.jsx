import { useState } from "react";
import axios from "axios";
import logohome from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import './style.css';

export default function ChatIA() {
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState("");
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");

  const enviar = async () => {
    if (!mensagem.trim()) return;
    setCarregando(true);
    setRecomendacoes([]);

    try {
      const res = await axios.post("http://localhost:3000/chat", { mensagem });
      const texto = res.data.recomendacoes;

      const linhas = texto.split('\n').filter((linha) => linha.trim() !== "");
      const itens = await Promise.all(
        linhas.map(async (linha) => {
          const match = linha.match(/"(.+?)"\s*-\s*(.+)/);
          if (!match) return null;

          const [_, titulo, artista] = match;
          const busca = `${titulo} ${artista}`;
          const searchRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
              key: import.meta.env.VITE_YOUTUBE_API_KEY,
              part: 'snippet',
              q: busca,
              type: 'video',
              maxResults: 1,
            },
          });

          const videoId = searchRes.data.items[0]?.id?.videoId;
          const urlYoutube = videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;

          try {
            const preview = await axios.get("https://api.microlink.io", {
              params: { url: urlYoutube },
            });

            const imagem = preview.data?.data?.image?.url || null;

            return {
              titulo,
              artista,
              imagem,
              url: urlYoutube,
            };
          } catch (e) {
            return {
              titulo,
              artista,
              imagem: null,
              url: urlYoutube,
            };
          }
        })
      );

      setRecomendacoes(itens.filter(Boolean));
    } catch (error) {
      console.error("Erro ao enviar para IA:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleAdicionar = async (rec) => {
    const token = localStorage.getItem('token');
    if (!token) return alert("Você precisa estar logado.");

    try {
      await axios.post("http://localhost:3000/links", {
        titulo: rec.titulo,
        url: rec.url,
        tipo: "track",
        genero: "outro",
        publico: true,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Adicionado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
            <a href="/">Página inicial</a>
            <a href="/curtidas">Curtidas</a>
            <a href="/meus-posts">Meus streamings</a>
            <a href="/sugestoes">Sugestões com IA</a>
          </nav>
        </aside>

        <main className="main-content">
          <div className="main-box">
            <div className="chat-container">

              <div className="chat-messages">
                {mensagem.trim() && <div className="message-user">{mensagem}</div>}

                {carregando && <div className="message-ai loading">Carregando...</div>}

                {recomendacoes.length > 0 && (
                  <div className="message-ai">
                    <ul className="recommendation-list">
                      {recomendacoes.map((rec, index) => (
                        <li key={index}>
                          {rec.imagem && (
                            <img src={rec.imagem} alt={rec.titulo} />
                          )}
                          <p><strong>{rec.titulo}</strong> - {rec.artista}</p>
                          <div className="recommendation-actions">
                            <a href={rec.url} target="_blank" rel="noopener noreferrer">Ouvir agora</a>
                            <button onClick={() => handleAdicionar(rec)}>Adicionar</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="input-area">
                <textarea
                  rows={2}
                  placeholder="Digite sua vibe, estilo ou situação..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="textarea-input"
                  disabled={carregando}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!carregando && mensagem.trim()) enviar();
                    }
                  }}
                />
                <button
                  onClick={() => { if (!carregando && mensagem.trim()) enviar(); }}
                  disabled={carregando || !mensagem.trim()}
                  className="button-send"
                >
                  {carregando ? "Carregando..." : "Enviar"}
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
