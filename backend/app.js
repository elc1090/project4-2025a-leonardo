const express = require('express')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

// Criar usuário
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

// Criar link
app.post('/links', async (req, res) => {
  const { usuarioId, url, titulo, descricao, tipo, tags, publico } = req.body

  try {
    const novoLink = await prisma.link.create({
      data: {
        usuarioId,
        url,
        titulo,
        descricao,
        tipo,
        tags,
        publico
      }
    })
    res.json(novoLink)
  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
})

// Listar links públicos
app.get('/links', async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      where: { publico: true },
      include: { usuario: true }
    })
    res.json(links)
  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})
