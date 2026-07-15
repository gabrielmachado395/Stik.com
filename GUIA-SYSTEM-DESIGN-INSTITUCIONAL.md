# Guia de System Design, Segurança e UI/UX — Página Institucional Stik

## Objetivo do documento

Este documento orienta o desenvolvimento da página institucional da Stik. Ele deve acompanhar as decisões de design, arquitetura, segurança, performance e experiência do usuário durante todo o projeto.

A proposta é construir uma presença institucional simples, moderna e confiável, com foco em:

- apresentar a empresa e sua história;
- valorizar os produtos;
- transmitir identidade, qualidade e credibilidade;
- direcionar visitantes para redes sociais e canais comerciais;
- funcionar bem em celulares, tablets, notebooks, desktops e telas grandes;
- manter boa performance também em dispositivos mais fracos.

Este guia complementa o arquivo `PLANO-MELHORIA-LAYOUT.md`, que continua útil como plano prático de evolução do layout.

---

## 1. Visão de produto

A página não precisa ser um sistema complexo. Ela deve ser uma vitrine institucional e comercial leve, organizada e fácil de navegar.

O visitante deve entender rapidamente:

1. quem é a Stik;
2. o que a empresa produz;
3. por que os produtos passam confiança;
4. onde ver mais conteúdos ou entrar em contato;
5. qual ação tomar em seguida.

### Tom desejado

- Profissional, mas humano.
- Moderno, mas sem exageros visuais.
- Industrial/comercial, mas com cuidado estético.
- Confiável, direto e bem acabado.

---

## 2. System design recomendado

### 2.1 Tipo de aplicação

Para o escopo atual, a melhor arquitetura é um site estático multipágina ou quase estático:

- HTML para estrutura;
- CSS puro para layout e identidade visual;
- JavaScript puro apenas para interações necessárias;
- imagens e vídeos otimizados;
- links externos para redes sociais e canais de contato.

Não há necessidade inicial de framework pesado, autenticação, painel administrativo ou backend complexo se o objetivo for apenas institucional.

### 2.2 Arquitetura de páginas

Estrutura recomendada:

- `index.html`: entrada principal, chamada institucional, destaques e produtos principais.
- `institucional.html`: história da empresa, valores, processo, diferenciais e confiança.
- `catalogo.html`: vitrine de produtos.
- `categoria.html`: listagem por categoria.
- páginas de apoio: FAQ, contato, blog/artigos se fizerem sentido.
- `header.html` e `footer.html`: componentes reaproveitados.

### 2.3 Separação de responsabilidades

Idealmente, o projeto deve caminhar para esta separação:

```text
HTML
  Conteúdo, hierarquia, semântica e SEO.

CSS
  Design system, responsividade, estados visuais e animações leves.

JavaScript
  Inclusão de componentes, filtros, navegação, menu mobile e pequenas interações.
```

Evitar que o JavaScript controle coisas que podem ser resolvidas com HTML e CSS. Quanto menos JS crítico para renderizar a página, melhor a performance e a robustez.

### 2.4 Conteúdo como parte da arquitetura

Como a página vende confiança, o conteúdo deve ser tratado como camada essencial do sistema:

- títulos claros;
- textos curtos e específicos;
- fotos bem escolhidas;
- produtos com nomes, categorias e descrições objetivas;
- chamadas para redes sociais ou contato em pontos estratégicos;
- prova de credibilidade: história, produção, experiência, qualidade, consistência.

---

## 3. Segurança

Mesmo sendo uma página institucional, alguns cuidados são importantes.

### 3.1 Links externos

Todo link que abre em nova aba deve usar:

```html
<a href="https://exemplo.com" target="_blank" rel="noopener noreferrer">...</a>
```

Isso evita que a página externa tenha controle sobre a aba original.

### 3.2 Dependências externas

O site atualmente usa recursos externos como fontes e ícones. Boas práticas:

- carregar somente o necessário;
- preferir versões fixas quando possível;
- evitar bibliotecas grandes para efeitos simples;
- avaliar hospedar fontes/ícones localmente se performance ou privacidade forem prioridade;
- remover scripts de terceiros que não tenham função clara.

### 3.3 Formulários

Se houver formulário de contato no futuro:

- validar dados no frontend e no backend;
- proteger contra spam;
- não expor e-mails administrativos sensíveis sem necessidade;
- usar HTTPS;
- nunca colocar tokens, senhas ou chaves de API no JavaScript público.

### 3.4 Conteúdo dinâmico

Se textos, produtos ou artigos forem carregados dinamicamente:

- não inserir HTML vindo de fonte externa sem sanitização;
- evitar `innerHTML` para conteúdo não confiável;
- preferir criação segura de elementos ou `textContent`;
- tratar erros de carregamento com mensagens amigáveis.

### 3.5 Cabeçalhos de segurança

Na hospedagem, configurar quando possível:

- HTTPS obrigatório;
- `Content-Security-Policy`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- redirecionamento de HTTP para HTTPS.

### 3.6 Privacidade

- Evitar rastreadores desnecessários.
- Se usar analytics, preferir solução leve e transparente.
- Não coletar dados se não houver necessidade real.
- Se usar cookies, informar o usuário conforme a necessidade legal.

---

## 4. Performance e compatibilidade

A página deve parecer bonita sem depender de alto poder de processamento.

### 4.1 Princípios

- Priorizar HTML e CSS sobre JavaScript.
- Reduzir peso de imagens e vídeos.
- Evitar animações contínuas ou que forcem repintura constante.
- Carregar primeiro o conteúdo essencial.
- Fazer a página funcionar mesmo se algum recurso externo falhar.

### 4.2 Imagens

Boas práticas:

- comprimir imagens;
- usar dimensões corretas para cada contexto;
- evitar imagens enormes exibidas pequenas;
- aplicar `loading="lazy"` em imagens fora da primeira dobra;
- definir `width` e `height` para reduzir layout shift;
- considerar formatos modernos como WebP/AVIF quando viável;
- manter uma imagem hero forte, mas otimizada.

### 4.3 Vídeos

Vídeos podem gerar impacto visual, mas devem ser usados com cuidado:

- evitar autoplay com áudio;
- comprimir bem;
- usar poster image;
- não depender do vídeo para transmitir a mensagem principal;
- pausar ou reduzir movimento em telas pequenas ou dispositivos fracos;
- considerar imagem estática no mobile se o vídeo pesar demais.

### 4.4 Fontes

- Usar poucas variações de peso.
- Definir fallback font.
- Usar `font-display: swap` quando possível.
- Evitar carregar famílias tipográficas demais.

### 4.5 JavaScript

- Manter scripts pequenos e previsíveis.
- Evitar bibliotecas para ações simples.
- Não bloquear a renderização inicial.
- Usar `defer` em scripts quando possível.
- Tratar falhas com mensagens claras no console durante desenvolvimento.

---

## 5. UI/UX para layout profissional

### 5.1 Hierarquia visual

Cada página deve ter uma hierarquia clara:

1. mensagem principal;
2. apoio visual;
3. produtos ou diferenciais;
4. história/confiança;
5. chamada para ação.

O usuário não deve precisar procurar o propósito da página.

### 5.2 Layout recomendado da home

Sugestão de composição:

1. **Hero institucional**  
   Frase forte, subtítulo curto, imagem/vídeo leve e CTA.

2. **Produtos em destaque**  
   Cards bem fotografados, nomes claros e categorias.

3. **Sobre a Stik**  
   História curta, origem, experiência e propósito.

4. **Diferenciais**  
   Qualidade, variedade, acabamento, atendimento, produção ou tradição.

5. **Categorias**  
   Alças, elásticos crus, viés e demais linhas.

6. **Chamada social/comercial**  
   Links para Instagram, WhatsApp, catálogo ou contato.

### 5.3 Página institucional

A página institucional deve contar a história com ritmo:

- origem da empresa;
- evolução;
- especialidade;
- compromisso com qualidade;
- relação com clientes;
- fotos ou elementos visuais reais;
- CTA final para ver produtos ou redes sociais.

Evitar texto muito longo em blocos densos. Melhor usar seções curtas com bom espaçamento.

### 5.4 Cards de produto

Cards devem ser consistentes:

- imagem limpa;
- nome visível;
- categoria;
- descrição curta;
- link ou botão para saber mais;
- estado de hover discreto;
- boa área de toque no mobile.

### 5.5 Cores e identidade

Usar a identidade da marca com consistência:

- cor principal para CTAs e detalhes;
- tons neutros para fundos e leitura;
- contraste suficiente;
- evitar excesso de cores competindo entre si;
- usar textura, fotografia ou detalhes gráficos para dar personalidade sem poluir.

### 5.6 Tipografia

- Títulos com presença, mas legíveis.
- Corpo de texto confortável.
- Linha entre 1.45 e 1.7 para textos maiores.
- Evitar textos muito pequenos no mobile.
- Usar escala tipográfica consistente.

### 5.7 Espaçamento

Um layout premium depende de respiro:

- seções com espaçamento vertical generoso;
- cards alinhados;
- margens consistentes;
- evitar elementos grudados;
- usar grids simples e previsíveis.

---

## 6. Responsividade e dispositivos

### 6.1 Mobile first

Projetar primeiro para celular e expandir para telas maiores.

Prioridades no mobile:

- carregamento rápido;
- menu simples;
- botões grandes o suficiente;
- textos legíveis;
- imagens proporcionais;
- evitar carrosséis complexos;
- evitar efeitos que dependem de hover.

### 6.2 Tablets

- Usar grids de 2 colunas quando couber.
- Manter boa área de toque.
- Evitar largura de texto exagerada.

### 6.3 Notebooks e desktops

- Aproveitar espaço com grids de 3 ou 4 colunas.
- Usar imagens maiores e composição mais editorial.
- Manter largura máxima de conteúdo para não espalhar demais.

### 6.4 TVs e telas muito grandes

- Definir `max-width` para conteúdo.
- Evitar linhas de texto muito longas.
- Usar fundos ou áreas visuais laterais para preencher sem distorcer.
- Garantir que imagens não fiquem pixeladas.

---

## 7. Animações leves e seguras para performance

Animações devem reforçar a experiência, não disputar atenção.

### 7.1 Recomendações

Usar animações em:

- entrada suave de seções;
- hover de cards;
- foco em botões;
- menu mobile;
- transições curtas de estados.

Evitar:

- animações infinitas sem propósito;
- parallax pesado;
- blur animado em grandes áreas;
- sombras enormes animadas;
- movimentação constante de muitos elementos;
- bibliotecas pesadas apenas para efeitos simples.

### 7.2 Propriedades mais performáticas

Preferir animar:

```css
transform
opacity
```

Evitar animar com frequência:

```css
width
height
top
left
margin
filter
box-shadow grande
```

### 7.3 Duração e sensação

- Microinterações: 120ms a 200ms.
- Entradas de seção: 250ms a 450ms.
- Easing natural: `ease`, `ease-out` ou curva customizada simples.
- Nada deve atrasar a leitura do conteúdo.

### 7.4 Acessibilidade de movimento

Sempre respeitar usuários que preferem menos movimento:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Acessibilidade

Acessibilidade também melhora profissionalismo e SEO.

### 8.1 Semântica

- Usar apenas um `h1` principal por página.
- Manter hierarquia correta de `h2`, `h3`, etc.
- Usar `main`, `section`, `nav`, `footer` e `header` corretamente.
- Botões devem ser botões; links devem ser links.

### 8.2 Navegação por teclado

- Todo item interativo deve ser acessível por teclado.
- Estados de foco devem ser visíveis.
- Menus mobile devem abrir e fechar de forma previsível.

### 8.3 Texto alternativo

- Produtos precisam de `alt` descritivo.
- Imagens decorativas podem ter `alt=""`.
- O texto alternativo deve explicar a imagem, não repetir mecanicamente o nome do arquivo.

### 8.4 Contraste

- Garantir contraste suficiente entre texto e fundo.
- Evitar texto cinza claro sobre fundo claro.
- CTAs devem ser visualmente fortes.

---

## 9. SEO e compartilhamento

Como página institucional, o site deve ser fácil de encontrar e compartilhar.

### 9.1 Meta tags essenciais

Cada página importante deve ter:

- `title` específico;
- `meta description` clara;
- idioma `pt-br`;
- Open Graph para compartilhamento;
- imagem social otimizada.

### 9.2 Conteúdo indexável

- Textos importantes devem estar no HTML, não apenas em imagens.
- Evitar esconder conteúdo essencial atrás de JavaScript.
- Usar URLs e títulos claros.

### 9.3 Dados estruturados

Se fizer sentido, adicionar schema simples de organização/local business/produtos, sem exagerar.

---

## 10. Observabilidade simples

Mesmo sem backend, o projeto precisa ser fácil de diagnosticar.

Recomendações:

- evitar erros silenciosos no JavaScript;
- registrar no console apenas erros úteis durante desenvolvimento;
- tratar falhas ao carregar header/footer;
- documentar decisões em arquivos `.md`;
- manter uma checklist de verificação antes de publicar.

---

## 11. Checklist de qualidade antes de publicar

### Conteúdo

- [ ] A proposta da empresa fica clara nos primeiros segundos.
- [ ] A história está bem contada e sem texto excessivo.
- [ ] Produtos têm imagens, nomes e descrições consistentes.
- [ ] CTAs direcionam para redes sociais ou contato corretamente.

### UI/UX

- [ ] Layout funciona bem no mobile.
- [ ] Layout funciona bem em tablet, notebook e desktop.
- [ ] Espaçamentos estão consistentes.
- [ ] Cores e botões seguem uma identidade clara.
- [ ] Estados de hover, foco e toque estão definidos.

### Performance

- [ ] Imagens estão comprimidas.
- [ ] Vídeos estão otimizados ou substituídos no mobile quando necessário.
- [ ] JavaScript não bloqueia a renderização.
- [ ] Animações usam principalmente `transform` e `opacity`.
- [ ] A página continua utilizável em conexão lenta.

### Segurança

- [ ] Links externos usam `rel="noopener noreferrer"`.
- [ ] Não há chaves ou tokens no frontend.
- [ ] Dependências externas são necessárias e conhecidas.
- [ ] Formulários, se existirem, têm validação e proteção contra abuso.

### Acessibilidade

- [ ] Existe hierarquia correta de headings.
- [ ] Imagens têm `alt` adequado.
- [ ] Navegação por teclado funciona.
- [ ] Contraste é suficiente.
- [ ] `prefers-reduced-motion` é respeitado.

---

## 12. Direção recomendada para implementação

1. Consolidar identidade visual: cores, tipografia, espaçamento e botões.
2. Reestruturar a home com hero, produtos, história, diferenciais e CTA.
3. Melhorar a página institucional com narrativa mais forte e seções visuais.
4. Otimizar imagens e vídeos.
5. Revisar responsividade em mobile, tablet, desktop e telas grandes.
6. Aplicar segurança básica em links, scripts e dependências.
7. Adicionar animações leves somente onde melhorarem a percepção de qualidade.
8. Validar performance, acessibilidade e experiência no navegador.

---

## 13. Decisão arquitetural atual

Para o estágio atual do projeto, a melhor decisão é manter uma arquitetura estática, simples e bem organizada, sem adicionar framework por padrão.

Motivos:

- o escopo é institucional;
- o conteúdo pode ser servido rapidamente;
- reduz custo de manutenção;
- melhora compatibilidade com dispositivos fracos;
- evita complexidade desnecessária;
- permite foco em conteúdo, marca, performance e acabamento visual.

Frameworks ou CMS podem ser considerados no futuro se houver necessidade real de edição frequente de conteúdo, blog ativo, painel administrativo, integração comercial ou automações.
