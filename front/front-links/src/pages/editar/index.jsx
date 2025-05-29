import './style.css';
import img1 from '../../assets/1.png';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditarPost() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [titulo, setTitulo] = useState('');
  const [link, setLink] = useState('');
  const [tipo, setTipo] = useState('track');
  const [genero, setGenero] = useState('house');
  const [publico, setPublico] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarLink() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErro('Você precisa estar logado.');
          return;
        }
        const resposta = await axios.get(`https://keepdance-backend.onrender.com/links/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const dados = resposta.data;
        setTitulo(dados.titulo);
        setLink(dados.url);
        setTipo(dados.tipo);
        setGenero(dados.genero);
        setPublico(dados.publico);
      } catch (error) {
        console.error('Erro ao carregar o link:', error);
        setErro('Não foi possível carregar os dados do link.');
      }
    }

    carregarLink();
  }, [id]);

  const handleEditar = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErro('Você precisa estar logado para editar.');
        return;
      }

      await axios.put(
        `https://keepdance-backend.onrender.com/links/${id}`,
        { titulo, url: link, tipo, genero, publico },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/meus-posts'); 
    } catch (error) {
      console.error(error.response?.data || error.message);
      setErro('Erro ao editar. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="container">
      <a href="/">
        <img src={img1} alt="logo" className="logo" />
      </a>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleEditar();
        }}
      >
        <h1 className="title">Editar Link</h1>

        <input
          name="titulo"
          type="text"
          placeholder="Título"
          className="input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <input
          name="link"
          type="url"
          placeholder="URL"
          className="input"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
        />

        <select
          name="tipo"
          className="input"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        >
          <option value="track">Track</option>
          <option value="set">Set</option>
          <option value="clipe">Clipe</option>
        </select>

        <select
          name="genero"
          className="input"
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          required
        >
          <option value="house">House</option>
          <option value="techno">Techno</option>
          <option value="trance">Trance</option>
          <option value="drum_and_bass">Drum and Bass</option>
          <option value="dubstep">Dubstep</option>
          <option value="electro">Electro</option>
          <option value="deep_house">Deep House</option>
          <option value="progressive">Progressive</option>
          <option value="ambient">Ambient</option>
          <option value="acid_house">Acid House</option>
          <option value="garage">Garage</option>
          <option value="hardstyle">Hardstyle</option>
          <option value="psytrance">Psytrance</option>
          <option value="trap">Trap</option>
          <option value="future_bass">Future Bass</option>
          <option value="breakbeat">Breakbeat</option>
          <option value="glitch">Glitch</option>
          <option value="synthwave">Synthwave</option>
          <option value="bass_house">Bass House</option>
          <option value="melodic_techno">Melodic Techno</option>
          <option value="tropical_house">Tropical House</option>
          <option value="electro_house">Electro House</option>
          <option value="industrial">Industrial</option>
          <option value="big_room">Big Room</option>
          <option value="funk">Funk</option>
          <option value="outro">Outros</option>
        </select>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={publico}
            onChange={(e) => setPublico(e.target.checked)}
          />
          Público
        </label>

        <button type="submit" className="button">
          Salvar Alterações
        </button>

        {erro && <p style={{ color: 'red', marginTop: '10px' }}>{erro}</p>}
      </form>
    </div>
  );
}

export default EditarPost;
