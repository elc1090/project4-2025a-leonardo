import { useState } from "react";
import axios from "axios";
import logohome from '../../assets/logo.png'; // ajuste o caminho se necessário
import { useNavigate } from 'react-router-dom';
import './style.css';

export default function ChatIA() {
  const navigate = useNavigate();

  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");

  const gerarLinksYoutube = (texto) => {
    const linhas = texto.split("\n").filter((linha) => linha.trim() !== "");
    return linhas.map((linha, index) => {
      const match = linha.match(/"(.+)"\s*-\s*(.+)/);
      if (match) {
        const nome = match[1];
        const artista = match[2];
        const busca = encodeURIComponent(`${nome} ${artista}`);
        const linkYoutube = `https://www.youtube.com/results?search_query=${busca}`;

        return (
          <li key={index}>
            <strong>{nome}</strong> - {artista}{" "}
            <a href={linkYoutube} target="_blank" rel="noopener noreferrer">
              🔗 YouTube
            </a>
          </li>
        );
      } else {
        return <li key={index}>{linha}</li>;
      }
    });
  };

  const enviar = async () => {
    if (!mensagem.trim()) return;
    setCarregando(true);
    setResposta("");

    try {
      const res = await axios.post(
        "http://localhost:3000/chat",
        { mensagem }
      );
      setResposta(res.data.recomendacoes);
    } catch (error) {
      console.error("Erro ao enviar para IA:", error);
      setResposta("Erro ao gerar recomendação.");
    } finally {
      setCarregando(false);
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

                {resposta && !carregando && (
                  <div className="message-ai">
                   
                    <ul className="recommendation-list">{gerarLinksYoutube(resposta)}</ul>
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
                  onClick={() => {
                    if (!carregando && mensagem.trim()) enviar();
                  }}
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
