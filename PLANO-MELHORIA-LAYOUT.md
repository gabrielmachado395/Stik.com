# Plano de Melhoria de Layout

## Objetivo

Modernizar a interface do projeto mantendo a stack atual:

- HTML multipágina
- CSS puro
- JavaScript puro

Sem migração para framework. A proposta é elevar consistência visual, legibilidade, responsividade e percepção de marca, reduzindo retrabalho estrutural.

## Diagnóstico Atual

### Pontos fortes

- A base já está organizada em páginas HTML separadas por contexto.
- Existe reaproveitamento de header, sidebar e footer.
- O projeto já tem identidade visual, catálogo, páginas institucionais e interações básicas.

### Problemas que hoje limitam o layout

- O CSS está centralizado em um único arquivo grande (`stylesheet/css/style.css`), misturando home, catálogo, produto, blog, FAQ, footer e regras responsivas.
- O JavaScript centraliza dados, renderização e interações no mesmo arquivo (`stylesheet/script.js`), o que dificulta evoluir o comportamento visual com segurança.
- O layout depende bastante de ajustes pontuais por página, em vez de um sistema visual consistente.
- Há inconsistências de marcação HTML que aumentam risco de quebra visual:
  - `header.html` contém um `<head>` dentro do `<header>`.
  - `produto.html` tem fechamento de tags desalinhado.
  - `sidebar.html` possui listas aninhadas com marcação irregular.
- A experiência mobile existe, mas parece adaptada depois, não desenhada primeiro.
- A identidade visual atual funciona, mas ainda não transmite um padrão premium de forma consistente.
- Há sinais de problemas de encoding em textos e nomes de categorias, o que afeta percepção de qualidade.

## Direção de Redesign

### Meta visual

Levar o site para uma linguagem mais premium, editorial e industrial ao mesmo tempo:

- visual mais limpo
- mais contraste entre conteúdo e fundo
- tipografia com hierarquia mais clara
- blocos com mais respiro
- cards e seções com ritmo visual consistente
- navegação mais intuitiva em desktop e mobile

### Princípios

- manter o dark mode como identidade principal, mas refinado
- tratar o light mode como variante consistente, não como adaptação parcial
- reduzir ruído visual
- melhorar escaneabilidade
- destacar produto e marca antes de destacar efeito visual
- usar animações leves e úteis, não excessivas

## Arquitetura Recomendada do Frontend

Continuando nas mesmas linguagens, a melhoria ideal é reorganizar a camada visual:

### HTML

- manter páginas separadas
- padronizar estrutura base de todas as páginas
- revisar semântica: `header`, `nav`, `main`, `section`, `footer`
- corrigir nesting inválido e markup duplicado

### CSS

Dividir o CSS em arquivos lógicos, ainda em CSS puro:

- `base.css`
- `tokens.css`
- `layout.css`
- `components.css`
- `pages/home.css`
- `pages/product.css`
- `pages/category.css`
- `pages/institutional.css`
- `pages/blog.css`
- `pages/forms.css`
- `responsive.css`

Mesmo que a carga final continue simples, essa separação reduz risco e acelera evolução.

### JavaScript

Separar responsabilidades, ainda em JavaScript puro:

- carregamento de partials
- navegação e sidebar
- tema
- busca
- renderização de catálogo
- renderização de produto
- animações e interações

## Prioridades de UI

### 1. Base visual

Criar um mini design system:

- paleta oficial com variáveis CSS
- escala tipográfica
- espaçamentos fixos
- raios de borda
- sombras
- estados de hover/focus
- largura padrão de containers

### 2. Header e navegação

Melhorias propostas:

- header mais sólido ao scroll
- logo com mais presença
- menu lateral com hierarquia visual melhor
- destaque mais claro para categorias
- busca com resultado mais limpo
- navegação mobile menos “apertada”

### 3. Home

Melhorias propostas:

- hero com overlay de conteúdo, título e CTA claros
- transformar “Produtos” em entrada real para categorias
- catálogo com cards mais uniformes
- criar seções com narrativa: marca, linhas, diferenciais, contato
- usar grid com ritmo visual mais sofisticado

### 4. Página de categoria

Melhorias propostas:

- título e descrição mais fortes
- filtros ou atalhos por linha, se fizer sentido
- cards com imagem, nome e contexto visual consistente
- espaçamento e alinhamento mais previsíveis

### 5. Página de produto

Essa deve ser uma das páginas com maior ganho.

Melhorias propostas:

- galeria mais limpa
- bloco de informações com hierarquia melhor
- título, subtítulo e descrição com leitura mais confortável
- CTA ou ação comercial mais clara
- seção “Veja também” mais relevante e visualmente conectada

### 6. Institucional e blog

Melhorias propostas:

- transformar o institucional em narrativa de marca, não apenas blocos empilhados
- aplicar grid editorial
- melhorar legibilidade dos textos
- padronizar imagens e respiros
- no blog, reforçar listagem de artigos com cards consistentes

### 7. Footer e contato

Melhorias propostas:

- footer com melhor agrupamento de links
- área de contato com visual mais confiável
- formulário com estados claros
- WhatsApp flutuante menos invasivo

## Roadmap de Execução

### Fase 1. Saneamento estrutural

- corrigir HTML inválido dos componentes compartilhados
- revisar encoding e textos quebrados
- mapear classes duplicadas ou contraditórias
- criar tokens visuais base

Resultado esperado:
uma base estável para mexer no layout sem criar regressões difíceis.

### Fase 2. Design system e layout global

- refatorar tipografia, cores e containers
- redesenhar header, sidebar e footer
- padronizar botões, cards, títulos e grids

Resultado esperado:
consistência visual em todas as páginas.

### Fase 3. Home e páginas comerciais

- redesenhar home
- redesenhar categoria
- redesenhar produto

Resultado esperado:
melhora real na percepção de marca e navegação de catálogo.

### Fase 4. Páginas de apoio

- institucional
- blog
- FAQ
- contato
- privacidade e termos

Resultado esperado:
site inteiro com linguagem visual unificada.

### Fase 5. Polimento

- microinterações
- performance visual
- acessibilidade
- revisão final mobile

## Critérios de Sucesso

- o site parecer um sistema único, não um conjunto de páginas isoladas
- navegação mais clara em desktop e mobile
- leitura mais confortável em páginas longas
- cards e seções com padrão repetível
- menos regras CSS improvisadas por página
- menor risco de quebra ao adicionar novos produtos e conteúdos

## Ordem Recomendada de Implementação

1. Corrigir estrutura compartilhada (`header.html`, `sidebar.html`, `footer.html`, `produto.html`)
2. Extrair tokens visuais e padrões globais
3. Refazer header, menu e footer
4. Refazer home
5. Refazer categoria e produto
6. Refazer institucional, blog e formulários
7. Revisar responsividade e acessibilidade

## Observações Técnicas

- Não recomendo migrar para React, Vue ou Tailwind nesta etapa.
- O maior ganho virá de organização visual e estrutural, não de trocar tecnologia.
- Vale manter a stack atual e melhorar o modo como HTML, CSS e JS estão divididos.

## Próximo Passo Prático

Se formos executar esse plano, o melhor começo é:

1. limpar a estrutura compartilhada
2. separar o CSS por responsabilidade
3. redesenhar primeiro `header`, `home` e `produto`

Esse trio deve gerar o maior impacto visual com o menor risco técnico.
