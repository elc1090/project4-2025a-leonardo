const express = require('express')
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const SECRET = 'chave'
const passport = require('passport');
require('./googleAuth');
const session = require('express-session');
require('dotenv').config();

const app = express()
const prisma = new PrismaClient()
const { GoogleGenerativeAI } = require('@google/generative-ai');


app.use(express.json())
const cors = require('cors')
  app.use(cors())

  app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

//  proteger rotas
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ erro: 'Token não fornecido' })

  jwt.verify(token, SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' })
    req.usuario = usuario
    next()
  })
}



// Rota para cadastrar usuário
app.post('/usuarios', async (req, res) => {
  const { nomeUsuario, email, senha } = req.body
  try {
    const novoUsuario = await prisma.usuario.create({
      data: { nomeUsuario, email, senha }
    })
    res.json(novoUsuario)
  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
})

// Rota para login (gera token JWT)
app.post('/login', async (req, res) => {
  const { email, senha } = req.body
  console.log('Recebido no login:', { email, senha })  // log do que chegou

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    console.log('Usuário encontrado:', usuario)  // log do usuário no banco

    if (!usuario || usuario.senha !== senha) {
      console.log('Credenciais inválidas')  // log se falhar
      return res.status(401).json({ erro: 'Credenciais inválidas' })
    }

    const token = jwt.sign(
      { id: usuario.id, nomeUsuario: usuario.nomeUsuario },
      SECRET,
      { expiresIn: '1h' }
    )

    console.log('Login OK - token gerado')  // log sucesso
    res.json({ token })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ erro: error.message })
  }
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: req.user.id, nomeUsuario: req.user.nomeUsuario },
      SECRET,
      { expiresIn: '1h' }
    );
    // Redireciona para o frontend passando o token na URL
    res.redirect(`${process.env.FRONTEND_URL || 'https://keepdance.netlify.app/'}/login?token=${token}`);
  }
);

// Criar link 
app.post('/links', autenticarToken, async (req, res) => {
  const { url, titulo, tipo, genero, publico } = req.body;

  try {
    const novoLink = await prisma.link.create({
      data: {
        usuarioId: req.usuario.id,
        url,
        titulo,
        tipo,
        genero,
        publico
      }
    });
    res.json(novoLink);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

async function gerarPreview(url) {
  try {
    const resposta = await axios.get('https://api.microlink.io', {
      params: { url }
    });
    const dados = resposta.data.data; // os dados da página

    return {
      titulo: dados.title,
      imagem: dados.image.url,
    };
  } catch (error) {
    console.error('Erro ao gerar preview:', error);
    return null;
  }
}

// Listar links 
app.get('/links', async (req, res) => {
  const usuarioId = req.query.usuarioId; 

  try {
    const links = await prisma.link.findMany({
      where: { publico: true },
      include: {
        usuario: {
          select: {
            nomeUsuario: true
          }
        },
        favoritos: {
          where: { usuarioId: usuarioId }
        }
      }
    });

    const linksComCurtido = links.map(link => {
      const { favoritos, ...resto } = link;
      return {
        ...resto,
        curtido: favoritos.length > 0
      };
    });

    res.json(linksComCurtido);
  } catch (error) {
    console.error('Erro na rota /links:', error); 
    res.status(500).json({ erro: error.message });
  }
});

const handleLogout = () => {
  localStorage.removeItem('token'); // Remove o token
  navigate('/login'); // Redireciona para a tela de login
};

app.post('/favoritos', autenticarToken, async (req, res) => {
  const usuarioId = req.usuario.id;  
  const { linkId } = req.body;

  if (!usuarioId || !linkId) {
    return res.status(400).json({ mensagem: 'Dados incompletos' });
  }

  try {
    const favoritoExistente = await prisma.favorito.findFirst({
      where: { usuarioId, linkId },
    });

    if (favoritoExistente) {
      return res.status(400).json({ mensagem: 'Já curtido' });
    }

    const favorito = await prisma.favorito.create({
      data: { usuarioId, linkId },
    });

    res.json(favorito);
  } catch (error) {
    console.error('Erro ao curtir:', error);  
    res.status(500).json({ mensagem: 'Erro ao curtir' });
  }
});



app.delete('/favoritos', autenticarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { linkId } = req.body;

  if (!linkId) {
    return res.status(400).json({ mensagem: 'ID do link é obrigatório' });
  }

  try {
    await prisma.favorito.deleteMany({
      where: { usuarioId, linkId },
    });

    res.json({ mensagem: 'Descurtido com sucesso' });
  } catch (error) {
    console.error('Erro ao descurtir:', error);
    res.status(500).json({ mensagem: 'Erro ao descurtir' });
  }
});

// ROTA PARA O CHATBOT DE RECOMENDAÇÃO
app.post('/chat', async (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem) {
    return res.status(400).json({ erro: 'A mensagem é obrigatória.' });
  }

  try {
    // Sem buscar links curtidos do usuário (não tem user id)
    const generosFavoritos = 'Nenhum ainda';

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

   const prompt = `
    You are "KeepDancer", a DJ and electronic music expert inside the KeepDance app.
    A user is asking for a music recommendation.

    User context:
    - Genres they’ve enjoyed before: ${generosFavoritos}

    User message: "${mensagem}"

    Your task:
    1. Reply with a friendly and energetic tone, as if you're a real DJ talking to a fan.
    2. Recommend between 2 to 4 songs or DJ sets that fit the user's taste.
    3. **IMPORTANT**: List each recommendation on a separate line, using EXACTLY this format: "Track Name" - Artist Name. Do NOT use bullets, numbers, or extra formatting. Always prioritize the most popular or most streamed tracks.
    Example output format:
    "Strobe" - deadmau5  
    "Opus" - Eric Prydz
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ recomendacoes: text });

  } catch (error) {
    console.error("Erro ao comunicar com a IA:", error);
    res.status(500).json({ erro: 'Ocorreu um erro ao processar sua solicitação.' });
  }
});


app.delete('/links/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;

  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

  if (!isValidObjectId(id)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  try {
    const link = await prisma.link.findUnique({ where: { id } });

    if (!link) {
      return res.status(404).json({ mensagem: 'Link não encontrado' });
    }

    if (link.usuarioId !== req.usuario.id) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para excluir este link' });
    }

    // exclui favoritos relacionados primeiro
    await prisma.favorito.deleteMany({
      where: { linkId: id },
    });


    await prisma.link.delete({
      where: { id },
    });

    res.json({ mensagem: 'Link excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir link:', error);
    res.status(500).json({ mensagem: 'Erro interno ao excluir link' });
  }
});


app.put('/links/:id', autenticarToken, async (req, res) => {
  const linkId = req.params.id; 
  const usuarioId = req.usuario.id;
  const { url, titulo, tipo, genero, publico } = req.body;

  const isValidId = /^[0-9a-fA-F]{24}$/.test(linkId);
  if (!isValidId) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  try {
    const link = await prisma.link.findUnique({
      where: { id: linkId }
    });

    if (!link) {
      return res.status(404).json({ erro: 'Link não encontrado' });
    }

    if (link.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Você não tem permissão para editar este link' });
    }

    const linkAtualizado = await prisma.link.update({
      where: { id: linkId },
      data: { url, titulo, tipo, genero, publico }
    });

    res.json(linkAtualizado);
  } catch (error) {
    console.error('Erro ao editar link:', error);
    res.status(500).json({ erro: error.message });
  }
});

app.get('/links/:id', autenticarToken, async (req, res) => {
  const linkId = req.params.id;

  const isValidId = /^[0-9a-fA-F]{24}$/.test(linkId);
  if (!isValidId) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  try {
    const link = await prisma.link.findUnique({
      where: { id: linkId }
    });

    if (!link) {
      return res.status(404).json({ erro: 'Link não encontrado' });
    }

    res.json(link);
  } catch (error) {
    console.error('Erro ao buscar link:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar link' });
  }
});
