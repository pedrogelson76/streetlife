# STREETLIFE — Plataforma de Batalhas de Looks (Streetwear & Sportlife)

Uma aplicação web completa, funcional e responsiva focada em batalhas de looks da cultura streetwear, quadros de campeões, curadoria editorial independente e valorização da comunidade.

---

## 💎 Identidade Visual

- **Paleta de Cores:** Preto absoluto (`#050507`), Prata cromada, Cinza metálico, Ouro no pódio e Branco puro.
- **Estética:** Streetwear de luxo, futurista, cyber-urbana e minimalista.
- **Logotipo Oficial:** Tipografia cromada `STREETLIFE` com coroa estilizada e anel orbital.
- **Efeitos:** Efeitos metálicos, vidros escuros (*glassmorphism*), celebração com confetes dinâmicos no pódio e microinterações táteis.
- **100% Responsivo:** Otimizado para smartphones, tablets e desktops de alta resolução.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Vite.
- **Estilização:** Tailwind CSS com paleta customizada metálica/cromada.
- **Ícones:** Lucide React (Coroa, Espadas, Troféu, Brilho, Escudo, etc.).
- **Backend / BaaS:** Supabase (PostgreSQL, Supabase Auth, Row Level Security, Triggers e Supabase Realtime).
- **Roteamento:** React Router DOM v7.
- **Animações e Efeitos:** Canvas Confetti para consagração do pódio.

---

## 📂 Estrutura de Páginas e Navegação

1. **Início (`/`):** Hero section impactante, banner de temporada, destaque do Look da Semana ativo, chamada da batalha atual e prévia da galeria da comunidade.
2. **Batalhas (`/batalhas`):** Listagem de edições, filtros por status (Todas, Abertas, Em Votação, Concluídas), modal com detalhes de tema, regras, premiações e looks inscritos.
3. **Campeões (`/campeoes`):** Hall da Fama oficial com apresentação do pódio:
   - **1º Lugar (Campeão Supremo):** Tratamento visual dourado premium, coroa orbital e confetes.
   - **2º Lugar (Prata) & 3º Lugar (Bronze):** Cards metálicos detalhados.
   - **Histórico de Edições Anteriores:** Seletor e arquivo histórico.
4. **Look da Semana (`/look-da-semana`):** Espaço editorial independente das batalhas para consagrar o visual com melhor caimento e autenticidade da semana, incluindo comentários da curadoria e histórico de edições passadas.
5. **Comunidade (`/comunidade`):** Galeria de membros e looks, filtros por tags de estilo (`#sportlife`, `#techwear`, `#drill`, etc.), modal com breakdown de peças/marcas e modal para envio de novos looks.
6. **Login (`/login`):** Autenticação segura com e-mail e senha, persistência de sessão e fluxo de redefinição de senha.
7. **Cadastro (`/cadastro`):** Criação de conta minimalista solicitando **apenas e-mail e senha** (sem dados invasivos como CPF ou telefone).
8. **Painel Administrativo (`/admin`):** Área privada e protegida por RLS no servidor:
   - Gerenciamento de Batalhas (CRUD).
   - Registro de Pódio e Vencedores (1º, 2º e 3º lugares).
   - Gerenciamento de Looks da Comunidade.
   - Seleção e Ativação do Look da Semana.
   - **Novos Usuários (Realtime):** Monitoramento ao vivo de novos cadastros via Supabase Realtime, contador de não lidos, marcação de visualizados e alertas web.

---

## 🗄️ Esquema do Banco de Dados (Supabase)

O script SQL completo está disponível no arquivo:
```
supabase/schema.sql
```

Ele cria:
- `public.admin_users`: Registro de administradores autorizados.
- `public.is_admin(check_user_id)`: Função com `SECURITY DEFINER` e `search_path = public` para validação de privilégios.
- `public.profiles`: Perfis públicos mínimos.
- `public.battles`: Edições de competições, temas, datas e premiações.
- `public.looks`: Looks enviados pela comunidade ou curadoria.
- `public.battle_results`: Colocações únicas por edição (1º, 2º e 3º lugares).
- `public.look_of_the_week`: Destaques editoriais semanais.
- `public.user_notifications`: Registro automático de novos cadastros.
- **Trigger `on_auth_user_created`**: Gatilho seguro em `auth.users` que dispara `public.handle_new_user()`, gerando perfil público e inserindo notificação para administradores.
- **Políticas RLS Rigorosas**: Usuários comuns e visitantes nunca conseguem acessar notificações ou dados restritos de administração.

---

## ⚙️ Passo a Passo de Instalação e Execução

### 1. Clonar ou Acessar a Pasta do Projeto

```bash
cd streetlife
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e insira suas credenciais do projeto Supabase:

```env
VITE_SUPABASE_URL=https://seu-id-de-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-publica
```

> **Dica:** O sistema também conta com um modal interativo de **Setup** acessível diretamente pela interface (botão no cabeçalho), permitindo testar e salvar as credenciais no navegador caso deseje.

### 4. Executar o Esquema no Supabase

1. Acesse o painel do seu projeto no Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. No menu lateral, clique em **SQL Editor**.
3. Abra ou cole o conteúdo do arquivo `supabase/schema.sql`.
4. Clique em **Run** para criar tabelas, índices, triggers, funções e políticas RLS.

---

## 👑 Como Definir o Primeiro Administrador

Por segurança, privilégios administrativos nunca são concedidos no navegador. Para se tornar o primeiro administrador:

### Opção A (Automática via Interface):
1. Cadastre-se na aplicação pela página `/cadastro`.
2. Acesse `/admin`.
3. Se você for o primeiro usuário e ainda não houver nenhum administrador registrado no banco, a interface exibirá o botão:
   **"Reivindicar Primeiro Administrador"**.
4. Ao clicar, o Supabase executa a função segura `claim_initial_admin()`, promovendo sua conta.

### Opção B (Direto no SQL Editor do Supabase):
1. Copie o UUID do seu usuário em **Authentication → Users**.
2. No **SQL Editor**, execute:
   ```sql
   INSERT INTO public.admin_users (user_id, role)
   VALUES ('SEU-UUID-DE-USUARIO-AQUI', 'admin')
   ON CONFLICT (user_id) DO NOTHING;
   ```

---

## 🔔 Notificações de Novos Usuários (Realtime)

1. Quando um novo usuário conclui o cadastro em `/cadastro`, o gatilho `on_auth_user_created` do PostgreSQL insere uma linha em `public.user_notifications`.
2. A tela **Novos usuários** no Painel Administrativo ouve as alterações via canal `supabase_realtime`.
3. A lista se atualiza instantaneamente sem necessidade de recarregar a página.
4. O administrador pode clicar em **"Ativar Alertas no Navegador"** para receber avisos nativos na área de trabalho enquanto a aba estiver aberta.

---

## 🛠️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento Vite.
- `npm run build`: Compila e valida o projeto com TypeScript e empacota para produção.
- `npm run preview`: Visualiza o build de produção localmente.

---

## 🚀 Publicação / Deploy em Produção

A aplicação pode ser implantada diretamente na **Vercel**, **Netlify**, **Cloudflare Pages** ou qualquer provedor estático:

1. Conecte o repositório Git ao provedor.
2. Defina o comando de build: `npm run build`.
3. Defina o diretório de saída: `dist`.
4. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Ative a regra de reescrita para Single Page Application (SPA), garantindo que todas as rotas redirecionem para `index.html`.

---

© STREETLIFE — Todos os direitos reservados.
