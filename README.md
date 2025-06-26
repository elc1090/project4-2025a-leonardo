![image](https://github.com/user-attachments/assets/8c05de2a-d23f-4e3c-92a5-ae5a6bb725e8)

### Desenvolvedor

* Leonardo Garcia Balk — Sistemas de Informação

### Acesso

## Acesso: https://keepdance.netlify.app/ 
## Backend: https://keepdance-backend.onrender.com/

### O projeto

O projeto é uma plataforma web para **compartilhamento e organização de links de streaming de música eletrônica**. Usuários autenticados podem:

* Adicionar links com título, gênero e tipo;
* Ver uma prévia automática do conteúdo (imagem e título da página);
* Curtir e descurtir links de outros usuários;
* Pesquisar por palavras-chave;
* Ver apenas os links curtidos;
* Acessar diretamente o conteúdo em nova aba;
* *Cadastrar, editar e deletar seus próprios links**;
* *Ver todos os seus links na página "Meus Posts"**;
* *Editar e excluir links já cadastrados**;
* *Logout rápido, removendo o token de autenticação**;
* *Login com Google (OAuth)**, além do login tradicional;
* *Página de sugestões com integração de IA** para recomendações musicais (ou feedback).

Esta aplicação foi desenvolvida com a temática **"Compartilhamento"** pois permite que usuários contribuam com links musicais e interajam com os links de outros, criando uma rede de recomendações.

---

### Desenvolvimento

O projeto foi desenvolvido do zero com backend Node.js (Express) e frontend com React.
O processo de desenvolvimento envolveu:

1. Criação das rotas de API REST no backend (auth, links, favoritos);
2. Integração com Microlink API para gerar previews de links;
3. Frontend com React (usando React Router, Axios e gerenciamento de estado com hooks);
4. Autenticação JWT com verificação de token;
5. Autenticação OAuth via Google com Passport.js**;
6. CRUD completo para links, incluindo edição e remoção**;
7. Página dedicada "Meus Posts" para gerenciamento pessoal dos links**;
8. Página de sugestões com IA**.

---

#### Tecnologias utilizadas

* **Frontend**:

  * HTML, CSS
  * JavaScript
  * React
  * Axios
  * React Router DOM
  * Vite

* **Backend**:

  * Node.js
  * Express
  * Sequelize
  * SQLite
  * JWT
  * CORS
  * Passport.js (Google OAuth)

* **APIs externas**:

  * MicrolinkAPI
  * YoutubeAPI
  * Google OAuth
  * Google Gemini API

---

#### Ambiente de desenvolvimento

* Visual Studio Code
* Postman (testes de API)
* GitHub (controle de versão)

---

#### Referências e créditos

* Ferramentas de IA

---

Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2025a) em 2025a.
