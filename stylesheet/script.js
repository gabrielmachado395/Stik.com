// Dados

const produtos = [
    {
        id: 1,
        nome: "Carícia",
        categoria: "Base",
        imagem: "./img/Base/caricia-stik.png",
        descricao: "Base macia e maleável, pensada para conforto em peças íntimas e lingerie. Oferece boa elasticidade sem perder a forma, acabamento limpo e costura fácil, ideal para aplicações que exigem toque suave sobre a pele.",
        material: "Elástico",
    },
    {
        id: 2,
        nome: "Canoa",
        categoria: "Elásticos Crus",
        imagem: "./img/Elastícos Crus/canoa-stik.png",
        descricao: "Elástico cru de alta resistência, com superfície levemente áspera que facilita aderência em costuras industriais. Perfeito para projetos onde se requer durabilidade e estabilidade dimensional sem acabamento tingido.",
        material: "Elástico",
    },
    {
        id: 3,
        nome: "Cinta",
        categoria: "Modeladores",
        imagem: "./img/Modeladores/cinta-stik.png",
        descricao: "Elástico para modeladores com compressão controlada que modela a silhueta sem perder conforto. Boa recuperação elástica e resistência ao uso, indicado para peças com ajuste mais firme e sustentação localizada.",
        material: "Políester", 
    },
    {
        id: 4,
        nome: "Atena",
        categoria: "Personalizados",
        imagem: "./img/Personalizados/alcaatena-stik.png",
        descricao: "Solução personalizada com acabamento premium — ideal para alças e detalhes que pedem diferencial estético. Pode ser produzida em cores e larguras sob demanda, mantendo resistência e toque refinado.",
        material: "Elástico",
    },
    {
        id: 5,
        nome: "Belly",
        categoria: "Premium",
        imagem: "./img/Premium/belly-stik.png",
        descricao: "Elástico premium com toque acetinado e resistência superior ao desgaste. Desenvolvido para peças de alta-costura e coleções premium que exigem aparência sofisticada e desempenho consistente no tempo.",
        material: "Elástico",
    },
    {
        id: 6,
        nome: "Ana",
        categoria: "Rendas",
        imagem: "./img/Renda/ana-stik.png",
        descricao: "Renda delicada com boa estabilidade dimensional, ideal para aplicação em lingerie e detalhes decorativos. Possui acabamento que facilita a costura e mantém a elegância mesmo após lavagens repetidas.",
        material: "Elástico",
    },
    {
        id: 7,
        nome: "Magno",
        categoria: "Alça",
        imagem: "./img/Alças/magno-stik.png",
        descricao: "Alça robusta e confortável, projetada para suportar tensão sem deformar. Acabamento reforçado nas bordas e superfície agradável ao contato, indicada para peças com maior exigência de sustentação.",
        material: "Elástico",
    },
    {
        id: 8,
        nome: "Flor",
        categoria: "Lançamento de Elástico",
        imagem: "img/flor-stik.png",
        descricao: "Lançamento com excelente elasticidade — combina apelo estético com funcionalidade. Versátil para aplicações em moda íntima, esportiva e acessórios decorativos.",
        material: "Elástico",
    },
    {
        id: 9,
        nome: "Grécia",
        categoria: "Lançamento de Alça",
        imagem: "img/grecia-stik.png",
        descricao: "Nova alça com desenho clássico e construção reforçada, ideal para peças de vestuário que exigem segurança e estilo. Mantém a forma mesmo após uso prolongado e apresenta acabamento elegante.",
        material: "Elástico",
    },
    {
        id: 10,
        nome: "Diana",
        categoria: "Lançamento de Base",
        imagem: "img/diana-stik.png",
        descricao: "Base estruturada de lançamento que oferece suporte e leve compressão, sem comprometer o conforto. Excelente para confecção de peças que precisam de estabilidade na área do cós ou do busto.",
        material: "Elástico",
    },
    {
        id: 11,
        nome: "Ágda",
        categoria: "Viés",
        imagem: "img/agda-stik.png",
        descricao: "Viés flexível e resistente, ideal para acabamento de bordas e reforço de costuras. Boa maleabilidade facilita o trabalho em curvas e contornos, garantindo acabamento profissional.",
        material: "Elástico",
    },
    {
        id: 12,
        nome: "Atlas",
        categoria: "Com Arco",
        imagem: "img/atlas-stik.png",
        descricao: "Elástico com arco de sustentação integrado, projetado para fornecer estrutura adicional em peças como corsets e modeladores. Combina firmeza e conforto, permitindo modelagem sem perda da estética.",
        material: "Elástico",
    },
    {
        id: 13,
        nome: "Eros",
        categoria: "Lançamento de Viés",
        imagem: "img/eros-stik.png",
        descricao: "Viés de lançamento com toque refinado e excelente conformidade em costura manual ou industrial. Ideal para aplicações que exigem acabamento discreto e resistência a atrito.",
        material: "Elástico",
    },
    {
        id: 14,
        nome: "Chll",
        categoria: "Premium",
        imagem: "img/chll-stik.png",
        descricao: "Linha premium com visual contemporâneo e desempenho elevado — resistência à deformação e ótimo caimento. Indicado para coleções que priorizam durabilidade e aparência sofisticada.",
        material: "Elástico",
    },
    {
        id: 15,
        nome: "Ana",
        categoria: "Rendas",
        imagem: "img/ana-stik.png",
        descricao: "Versão alternativa da renda 'Ana' com padronagem levemente distinta; mantém suavidade e facilidade de aplicação. Perfeita para detalhes finos em lingerie e peças femininas delicadas.",
        material: "Elástico",
    },
];

let artigos = null;

/**
 * Carrega artigos de forma lazy a partir de um arquivo JSON (crie data/artigos.json).
 * Reduz o tempo de parsing do script principal.
 */
async function loadArtigos() {
    if (artigos) return artigos;
    try {
        const res = await fetch('./artigos.json');
        if (!res.ok) throw new Error('status ' + res.status);
        artigos = await res.json();
        return artigos;
    } catch (err) {
        console.error('Erro ao carregar artigos:', err);
        artigos = [];
        return artigos;
    }
}

// utilitário para adiar inicializações não-críticas
function deferInit(fn) {
    if (typeof fn !== 'function') return;
    if ('requestIdleCallback' in window) {
        requestIdleCallback(fn, { timeout: 800 });
    } else {
        setTimeout(fn, 200);
    }
}

// Funções para carregar e inicializar componentes
async function carregarComponente(id, url, callback) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;

    try {
        const response = await fetch(url);
        const html = await response.text();
        placeholder.innerHTML = html;
        
        if (callback && typeof callback === 'function') {
            callback();
        }
    } catch (error) {
        console.error(`Erro ao carregar o componente ${url}:`, error);
    }
}

async function carregarConteudoPrincipal(url) {
    const mainContentPlaceholder = document.getElementById('main-content-placeholder');
    if (!mainContentPlaceholder) return;

    try {
        const response = await fetch(url);
        const html = await response.text();
        mainContentPlaceholder.innerHTML = html;

        history.pushState(null, '', url);
        
        if (url.includes('blog.html')) {
            displayArticles();
            const createBtn = document.getElementById('create-article-btn');
            if (createBtn) {
                createBtn.addEventListener('click', createNewArticle);
            }
        } else if (url.includes('produto.html')) {
            carregarDetalhesDoProduto();
        } 
        inicializarAnimateOnScroll();
        inicializarNewsletterCarousel();

    } catch (error) {
        console.error(`Erro ao carregar o conteúdo ${url}:`, error);
    }
}

// --- Funções de persistência unificadas ---
function saveSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    localStorage.setItem('sidebarActive', sidebar.classList.contains('active'));

    const submenusAtivos = [];
    document.querySelectorAll('.submenu, .submenu-aninhado, .submenu-terceiro-nivel').forEach((submenu, index) => {
        if (submenu.classList.contains('active')) {
            submenusAtivos.push(index);
        }
    });
    localStorage.setItem('submenusAtivos', JSON.stringify(submenusAtivos));
}

function restoreSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const sidebarActive = localStorage.getItem('sidebarActive') === 'true';
    const overlay = document.getElementById('overlay');

    if (sidebarActive) {
        sidebar.classList.add('active');
        document.body.classList.add('sidebar-open');

        // só bloqueia scroll e mostra overlay em telas pequenas
        if (window.matchMedia('(max-width: 768px)').matches) {
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    } else {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    const submenusAtivos = JSON.parse(localStorage.getItem('submenusAtivos')) || [];
    document.querySelectorAll('.submenu, .submenu-aninhado, .submenu-terceiro-nivel').forEach((submenu, index) => {
        if (submenusAtivos.includes(index)) submenu.classList.add('active');
        else submenu.classList.remove('active');
    });

    // sincroniza ícones de chevron
    document.querySelectorAll('.has-submenu > .sidebar-link, .has-submenu-hover > .sidebar-link, .has-submenu > a, .has-submenu-hover > a').forEach(trigger => {
        const submenu = trigger.nextElementSibling;
        const icon = trigger.querySelector('.fas.fa-chevron-down, .fas.fa-chevron-right');
        if (submenu?.classList.contains('active') && icon) {
            if (icon.classList.contains('fa-chevron-down')) icon.classList.add('fa-rotate-180');
            else icon.classList.add('fa-rotate-90');
        } else if (icon) {
            icon.classList.remove('fa-rotate-180', 'fa-rotate-90');
        }
    });
}
// ------------------------------------------

function inicializarMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    // aceita tanto <a> como .sidebar-link, pra cobrir estruturas diferentes
    const submenuLinks = document.querySelectorAll('.has-submenu > .sidebar-link, .has-submenu-hover > .sidebar-link, .has-submenu > a, .has-submenu-hover > a');
    const allLinks = document.querySelectorAll('.sidebar-nav a');

    if (!sidebar) return;

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    // abre a sidebar (usa overlay somente no mobile)
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            document.body.classList.add('sidebar-open'); // <-- importante para empurrar conteúdo

            if (overlay) {
                if (isMobile()) {
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden'; // bloqueia scroll só no mobile
                } else {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }

            saveSidebarState();
        });
    }

    // fecha a sidebar (limpa localStorage e estado)
    const closeSidebarFn = () => {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');

        if (overlay) overlay.classList.remove('active');

        document.body.style.overflow = '';

        // limpa o estado salvo (o usuário fechou manualmente)
        localStorage.removeItem('sidebarActive');
        localStorage.removeItem('submenusAtivos');

        // remove classes visuais
        document.querySelectorAll('.submenu.active, .submenu-aninhado.active, .submenu-terceiro-nivel.active').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.fa-rotate-180, .fa-rotate-90').forEach(ic => ic.classList.remove('fa-rotate-180', 'fa-rotate-90'));
    };

    if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarFn);
    if (overlay) overlay.addEventListener('click', closeSidebarFn);

    // abrir/fechar submenus (só previne o link se realmente houver submenu)
    submenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const submenu = link.nextElementSibling;
            if (!submenu) return; // se não tiver submenu, segue o link normalmente

            // evita navegação do link pai (se for '#') e alterna submenu
            e.preventDefault();

            submenu.classList.toggle('active');

            const icon = link.querySelector('.fas.fa-chevron-down, .fas.fa-chevron-right');
            if (icon) {
                if (icon.classList.contains('fa-chevron-down')) {
                    icon.classList.toggle('fa-rotate-180');
                } else {
                    icon.classList.toggle('fa-rotate-90');
                }
            }

            saveSidebarState();
        });
    });

    // salva estado ao clicar em qualquer link (útil para navegação)
    allLinks.forEach(link => {
        link.addEventListener('click', () => {
            saveSidebarState();
        });
    });

    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector('.menu-toggle');

        if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            if (sidebar.classList.contains('active')){
                closeSidebarFn();
            }
        }
    })

    // também re-ativa o comportamento ao redimensionar (ex.: abrir no desktop, reduzir para mobile)
    window.addEventListener('resize', () => {
        // se a sidebar está aberta e o usuário redimensionou para desktop, garante overflow correto
        if (sidebar.classList.contains('active')) {
            if (!isMobile()) {
                document.body.style.overflow = '';
                if (overlay) overlay.classList.remove('active');
            } else {
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
}



// Funções para a página inicial
function criarProdutoCard(produto) {
    const produtoCard = document.createElement('a'); 
    produtoCard.classList.add('produto-card');
    produtoCard.href = `produto.html?id=${produto.id}`;
    
    produtoCard.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.categoria}">
        <h3>${produto.categoria}</h3>
    `;
    return produtoCard;
}

function exibirProdutos(produtosParaExibir) {
    const listaProdutosContainer = document.getElementById('lista-produtos');
    if (!listaProdutosContainer) return;
    
    listaProdutosContainer.innerHTML = '';
    
    if (produtosParaExibir.length === 0) {
        listaProdutosContainer.innerHTML = '<p class="no-results">Nenhum produto encontrado para sua busca.</p>';
        return;
    }
    
    produtosParaExibir.forEach(produto => {
        const card = criarProdutoCard(produto);
        listaProdutosContainer.appendChild(card);
    });
}

// Lógica de pesquisa
function inicializarPesquisa() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('searchInput');
    const searchResultsList = document.getElementById('searchResultsList');

    if (!searchToggle || !searchBox || !searchInput || !searchResultsList) {
        console.error("Um ou mais elementos de pesquisa não foram encontrados.");
        return;
    }

    // Toggle abre/fecha caixa de pesquisa
    searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const header = document.getElementById('mainHeader') || document.querySelector('.top-header');
        const opening = !searchBox.classList.contains('is-active');
        searchBox.classList.toggle('is-active');
        if (opening) {
            if (header) header.classList.add('search-open');
            searchInput.focus();
        } else {
            if (header) header.classList.remove('search-open');
            limparPesquisa();
        }
    });

    // Busca em tempo real
    searchInput.addEventListener('input', (e) => {
        const termoBusca = e.target.value.toLowerCase()
            .normalize("NFD") // Normaliza a string para decompor os caracteres
            .replace(/[\u0300-\u036f]/g, ""); // Remove os diacríticos (acentos)

        searchResultsList.innerHTML = '';

        if (termoBusca.length > 1) {
            const produtosFiltrados = produtos.filter(produto => {
                // Normaliza e remove acentos dos nomes e categorias dos produtos
                const nomeNormalizado = produto.nome.toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");
                const categoriaNormalizada = produto.categoria.toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");

                return nomeNormalizado.includes(termoBusca) || categoriaNormalizada.includes(termoBusca);
            });

            if (produtosFiltrados.length > 0) {
                produtosFiltrados.forEach(produto => {
                    const item = document.createElement('a');
                    item.href = `produto.html?id=${produto.id}`;
                    item.classList.add('search-result-item');
                    item.innerHTML = `
                        <img src="${produto.imagem}" alt="${produto.nome}" />
                        <span>${produto.nome} <small>(${produto.categoria})</small></span>
                    `;
                    searchResultsList.appendChild(item);
                });
                searchBox.classList.add('has-results');
            } else {
                searchBox.classList.remove('has-results');
                searchResultsList.innerHTML = '<p class="no-results-msg">Nenhum resultado encontrado.</p>';
            }
        } else {
            searchResultsList.innerHTML = '';
            searchBox.classList.remove('has-results');
        }
    });

    // Fecha a pesquisa ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
            const header = document.getElementById('mainHeader') || document.querySelector('.top-header');
            searchBox.classList.remove('is-active');
            if (header) header.classList.remove('search-open');
            limparPesquisa();
        }
    });

    function limparPesquisa() {
        searchResultsList.innerHTML = '';
        searchInput.value = '';
        searchBox.classList.remove('has-results');
        const header = document.getElementById('mainHeader') || document.querySelector('.top-header');
        if (header) header.classList.remove('search-open');
    }
}

function setupDraggableCarousel(carouselElement) {
    if (!carouselElement) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    
    const startDrag = (e) => {
        isDown = true;
        carouselElement.classList.add('active');
        startX = (e.pageX || e.touches[0].pageX);
        scrollLeft = carouselElement.scrollLeft;
    };

    const endDrag = () => {
        isDown = false;
        carouselElement.classList.remove('active');
    };

    const drag = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX);
        const walk = x - startX;
        carouselElement.scrollLeft = scrollLeft - walk;
    };
    
    carouselElement.addEventListener('mousedown', startDrag);
    carouselElement.addEventListener('mouseleave', endDrag);
    carouselElement.addEventListener('mouseup', endDrag);
    carouselElement.addEventListener('mousemove', drag);
    
    carouselElement.addEventListener('touchstart', startDrag, { passive: true });
    carouselElement.addEventListener('touchend', endDrag);
    carouselElement.addEventListener('touchcancel', endDrag);
    carouselElement.addEventListener('touchmove', drag, { passive: false });
}

function initBannerCarousel() {
    const bannerImages = [
        { src: "./img/banner/banner-site-8_Prancheta-1-scaled (1).jpg", alt: 'Elásticos para a sua confecção de moda fitness' },
        { src: "./img/banner/banner-site-10_Prancheta-1-scaled.jpg", alt: 'Renda-se aos nossos encantos!' },
        { src: "./img/banner/banner-site-11_Prancheta-1-scaled.jpg", alt: 'Catálogo Virtual' },
    ];
    
    const mainBannerTrack = document.getElementById('mainBannerTrack');
    const bannerPrevBtn = document.getElementById('bannerPrevBtn');
    const bannerNextBtn = document.getElementById('bannerNextBtn');

    if (!mainBannerTrack) return;

    bannerImages.forEach(img => {
        const item = document.createElement('div');
        item.classList.add('carousel-item');
        item.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
        mainBannerTrack.appendChild(item);
    });

    let currentIndex = 0;
    const totalItems = bannerImages.length;
    
    function moveToSlide(index) {
        if (index < 0) {
            index = totalItems - 1;
        } else if (index >= totalItems) {
            index = 0;
        }
        mainBannerTrack.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }

    if (bannerNextBtn) {
        bannerNextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
    }
    if (bannerPrevBtn) {
        bannerPrevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));
    }
    
    setInterval(() => {
        moveToSlide(currentIndex + 1);
    }, 5000);
    
    setupDraggableCarousel(mainBannerTrack);
}

// --- Micro interactions: parallax, staggered reveal and subtle tilt ---
function initMicroInteractions() {
    // parallax on hero (based on mouse move) - subtle
    const hero = document.querySelector('.video-hero-section');
    if (hero) {
        hero.classList.add('video-hero-inner');
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            const layers = hero.querySelectorAll('img, video');
            layers.forEach(el => {
                const depth = 10; // a bit stronger
                const tx = px * depth;
                const ty = py * depth;
                el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
            });
        });
        hero.addEventListener('mouseleave', () => {
            hero.querySelectorAll('img, video').forEach(el => el.style.transform = 'translate3d(0,0,0) scale(1)');
        });
    }

    // staggered reveal for highlight items on scroll (small delay between them)
    const highlights = document.querySelectorAll('.highlight-item');
    if (highlights.length) {
        highlights.forEach((item, idx) => {
            item.classList.add('staggered');
            // when in viewport, add class 'in' with a delay
            const io = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => item.classList.add('in'), idx * 110);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.18 });
            io.observe(item);
        });
    }

    // subtle tilt on produto cards
    const produtoCards = document.querySelectorAll('.produto-card, .article-card');
    produtoCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            const dx = (e.clientX - cx) / rect.width;
            const dy = (e.clientY - cy) / rect.height;
            const rotX = (dy * 8).toFixed(2);
            const rotY = (-dx * 8).toFixed(2);
            card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // newsletter carousel images parallax
    const carousel = document.querySelector('.carousel-bg .carousel-track');
    if (carousel) {
        carousel.addEventListener('mousemove', (e) => {
            const rect = carousel.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            carousel.querySelectorAll('img').forEach((img, idx) => {
                const depth = 8 + (idx % 3); // small variance
                const tx = px * depth;
                const ty = py * depth * 0.6;
                img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.03)`;
                img.style.filter = `brightness(${1 - Math.abs(px) * 0.08})`;
            });
        });
        carousel.addEventListener('mouseleave', () => {
            carousel.querySelectorAll('img').forEach(img => {
                img.style.transform = '';
                img.style.filter = '';
            });
        });
    }
}


function createNewArticle() {
    window.location.href = 'create-article.html';
}

function createArticleCard(article) {
    const card = document.createElement('a');
    card.href = `article.html?id=${article.id}`;
    card.classList.add('article-card');

    const firstImage = article.content.match(/<img[^>]+src="([^">]+)"/);
    const imageUrl = firstImage ? firstImage[1] : './img/default-blog.png';
    
    const contentWithoutHtml = new DOMParser().parseFromString(article.content, 'text/html').body.textContent;
    const trimmedContent = contentWithoutHtml.length > 150 ? contentWithoutHtml.substring(0, 150) + '...' : contentWithoutHtml;
    
    card.innerHTML = `
    <img src="${imageUrl}" alt="${article.title}">
    <div class="article-card-content">
            <h2>${article.title}</h2>
            <p>${trimmedContent}</p>
        </div>
    `;
    return card;
}


async function displayArticles() {
    const container = document.getElementById('artigos-container');
    if (!container) return;

    // carrega só quando necessário
    const lista = await loadArtigos();

    // limpa rapidamente sem forçar reflow por cada append
    container.innerHTML = '';

    if (!lista || lista.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum artigo encontrado.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    lista.forEach(artigo => {
        const articleEl = document.createElement('article');
        articleEl.className = 'blog-post';

        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'post-thumb';
        const linkThumb = document.createElement('a');
        linkThumb.href = `artigo.html?id=${artigo.id}`;
        const img = document.createElement('img');
        img.src = artigo.imagem;
        img.alt = artigo.titulo;
        img.loading = 'lazy';
        img.decoding = 'async';
        linkThumb.appendChild(img);
        thumbDiv.appendChild(linkThumb);

        const metaDiv = document.createElement('div');
        metaDiv.className = 'post-meta';
        metaDiv.innerHTML = `<span><i class="fas fa-user"></i> ${artigo.autor}</span>
                             <span><i class="fas fa-calendar-alt"></i> ${artigo.data}</span>`;

        const titleH2 = document.createElement('h2');
        titleH2.className = 'post-title';
        titleH2.innerHTML = `<a href="artigo.html?id=${artigo.id}">${artigo.titulo}</a>`;

        const excerptP = document.createElement('p');
        excerptP.className = 'post-excerpt';
        excerptP.textContent = artigo.resumo;

        const readMore = document.createElement('a');
        readMore.className = 'read-more';
        readMore.href = `artigo.html?id=${artigo.id}`;
        readMore.innerHTML = 'Read more <i class="fas fa-arrow-right"></i>';

        articleEl.appendChild(thumbDiv);
        articleEl.appendChild(metaDiv);
        articleEl.appendChild(titleH2);
        articleEl.appendChild(excerptP);
        articleEl.appendChild(readMore);

        fragment.appendChild(articleEl);
    });

    container.appendChild(fragment);
}


async function carregarArtigo() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    // garante dados carregados
    await loadArtigos();

    const artigo = (artigos || []).find(a => a.id === id);

    const articleTitleEl = document.getElementById('article-title');
    const articleMetaEl = document.getElementById('article-meta');
    const articleImageEl = document.getElementById('article-image');
    const articleContentEl = document.getElementById('article-content');

    if (!artigo) {
        if (articleContentEl) articleContentEl.innerHTML = "<h2>Artigo não encontrado.</h2>";
        return;
    }

    if (articleTitleEl) articleTitleEl.textContent = artigo.titulo;
    if (articleMetaEl) articleMetaEl.innerHTML = `Publicado por <span>${artigo.autor}</span> em ${artigo.data}`;
    if (articleImageEl) {
        articleImageEl.setAttribute('loading', 'lazy');
        articleImageEl.decoding = 'async';
        articleImageEl.src = artigo.imagem;
        articleImageEl.alt = artigo.titulo;
        // tentar decodificar sem bloquear
        if (articleImageEl.decode) articleImageEl.decode().catch(()=>{/* ignore */});
    }
    if (articleContentEl) articleContentEl.innerHTML = artigo.conteudoCompleto;

    // adia inits pesados de visibilidade/animations
    deferInit(() => {
        if (typeof inicializarAnimateOnScroll === 'function') inicializarAnimateOnScroll();
    });
}

function setupArticleForm() {
    const form = document.getElementById('article-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const titleInput = document.getElementById('article-title');
        const contentInput = document.getElementById('article-content');
        
        if (!titleInput.value || !contentInput.value) {
            alert('Por favor, preencha o título e o conteúdo.');
            return;
        }
        
        const newArticle = {
            id: Date.now(),
            title: titleInput.value,
            content: contentInput.value,
            date: new Date().toISOString()
        };
        
        const articles = JSON.parse(localStorage.getItem('blogArticles')) || [];
        articles.push(newArticle);
        localStorage.setItem('blogArticles', JSON.stringify(articles));
        
        alert('Artigo salvo com sucesso!');
        window.location.href = 'blog.html';
    });
}

function carregarDetalhesDoProduto() {
    const params = new URLSearchParams(window.location.search);
    const produtoId = parseInt(params.get('id'));
    const produto = produtos.find(p => p.id === produtoId);

    if (produto) {
        document.getElementById('main-product-image').src = produto.imagem;
        document.querySelector('.product-name').textContent = produto.nome;
        document.querySelector('.product-description').textContent = produto.descricao;
        document.querySelector('.product-material').textContent = produto.material;
        document.querySelector('.product-categoria').textContent = produto.categoria;

        const variationOptions = document.querySelector('.variation-options');
        if (variationOptions) {
            variationOptions.innerHTML = '';
        }
    } else {
        console.error("Produto não encontrado.");
    }
}

function inicializarNewsletterCarousel() {
    const placeholder = document.getElementById('catalogo-placeholder');
    if (!placeholder) return;

    fetch('catalogo.html')
        .then(response => response.text())
        .then(html => {
            placeholder.innerHTML = html; 
            inicializarAnimateOnScroll();
            // re-bind do form do catálogo quando o HTML for injetado
            bindCatalogForm();
        })
        .catch(error => console.error('Erro ao carregar catálogo:', error));
}

// Bind do formulário que envia o catálogo via backend
function bindCatalogForm() {
    const form = document.getElementById('catalog-form');
    const input = document.getElementById('catalog-email');
    const feedback = document.getElementById('catalog-feedback');
    if (!form || !input || !feedback) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = input.value.trim();
        const consentCheckbox = document.getElementById('catalog-consent');
        const consent = !!(consentCheckbox && consentCheckbox.checked);
        feedback.style.color = '#fff';
        if (!email) {
            feedback.textContent = 'Por favor digite um e-mail válido.';
            return;
        }
        if (!consent) {
            feedback.textContent = 'Por favor aceite receber comunicações marcando a caixa de consentimento.';
            return;
        }

        feedback.textContent = 'Enviando catálogo...';
        try {
            // tenta obter token reCAPTCHA se o widget estiver disponível
            let recaptchaToken = null;
            if (window.grecaptcha && window.RECAPTCHA_SITE_KEY) {
                try {
                    recaptchaToken = await window.grecaptcha.execute(window.RECAPTCHA_SITE_KEY, { action: 'send_catalog' });
                } catch (err) {
                    console.warn('Falha ao executar grecaptcha:', err);
                }
            }

            const payload = { email, consent };
            if (recaptchaToken) payload.recaptchaToken = recaptchaToken;

            const res = await fetch('/api/send-catalog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                feedback.style.color = '#b3ffd9';
                feedback.textContent = data.message || 'Catálogo enviado! Verifique seu e-mail.';
                input.value = '';
            } else {
                const err = await res.json().catch(()=>({ message: 'Erro desconhecido' }));
                feedback.style.color = '#ffd1d1';
                feedback.textContent = err.message || 'Falha ao enviar. Tente novamente mais tarde.';
            }
        } catch (error) {
            console.error('Erro ao chamar API local:', error);
            feedback.style.color = '#ffd1d1';
            feedback.textContent = 'Erro de conexão. Tente novamente.';
        }
    });
}

function inicializarAnimateOnScroll() {
    const elementosAnimar = document.querySelectorAll('.animate-on-scroll');
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementosAnimar.forEach(elemento => observer.observe(elemento));
}

function inicializarHeaderIndex() {
    const topHeader = document.getElementById('mainHeader');
    const videoHeroSection = document.querySelector('.video-hero-section');
    const headerHoverArea = document.getElementById('header-hover-area');
    
    if (!topHeader || !videoHeroSection || !headerHoverArea) {
        return;
    }

    const videoHeroHeight = videoHeroSection.clientHeight;

    const showHeader = () => {
        topHeader.classList.remove('is-hidden');
        topHeader.classList.add('is-visible');
    };

    const hideHeader = () => {
        topHeader.classList.remove('is-visible');
        topHeader.classList.add('is-hidden');
    };

    const updateHeaderOnScroll = () => {
        if (window.scrollY > (videoHeroHeight - 100)) {
            showHeader();
            topHeader.classList.add('scrolled');
        } else {
            topHeader.classList.remove('scrolled');
            if (!headerHoverArea.matches(':hover')) {
                hideHeader();
            }
        }
    };

    headerHoverArea.addEventListener('mouseenter', showHeader);

    window.addEventListener('scroll', updateHeaderOnScroll);

    updateHeaderOnScroll();
}

function inicializarHeaderPaginaSecundaria() {
    const topHeader = document.getElementById('mainHeader');
    if (topHeader) {
        topHeader.classList.add('is-visible', 'scrolled');
        topHeader.classList.remove('is-hidden');
    }
}


function inicializarPaginaFaq() {
    console.log("Página FAQ inicializada.");
}

function inicializarPaginaPolitica() {
    console.log("Página de Política de Privacidade inicializada.");
}

function inicializarPaginaTermos() {
    console.log("Página de Termos de Uso inicializada.");
}

function inicializarPaginaFaleConosco() {
    console.log("Página Fale Conosco inicializada.");
}

function inicializarModoClaro() {
    const themeToggleButton = document.querySelector('.icon-btn[aria-label="Modo Claro/Escuro"]');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light-mode') {
        document.body.classList.add('light-mode');
        const icon = themeToggleButton.querySelector('i');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            
            const icon = themeToggleButton.querySelector('i');
            
            if (document.body.classList.contains('light-mode')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light-mode');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark-mode');
            }
        });
    }
}

// Função principal de inicialização da página
async function inicializarPagina() {
    // A função de pesquisa será chamada dentro do callback do carregamento do header
    await carregarComponente('header-placeholder', 'header.html', inicializarPesquisa);
    
    // ATENÇÃO: A RESTAURAÇÃO DO ESTADO SÓ OCORRE AQUI DENTRO, APÓS O CARREGAMENTO DA SIDEBAR
    await carregarComponente('sidebar-placeholder', 'sidebar.html', () => {
        inicializarMenu();
        restoreSidebarState();
    });
    
    await carregarComponente('footer-placeholder', 'footer.html');
    
    deferInit(() => {
        inicializarNewsletterCarousel();
        inicializarModoClaro();
        initRecaptcha();
    });
        
    
    const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    const isProductPage = window.location.pathname.includes('produto.html');
    const isBlogPage = window.location.pathname.includes('blog.html');
    const isArticlePage = window.location.pathname.includes('artigo.html');
    const isCreateArticlePage = window.location.pathname.includes('create-article.html');
    const isFaqPage = window.location.pathname.includes('faq.html');
    const isPoliticaPage = window.location.pathname.includes('politica_de_privacidade.html');
    const isTermosPage = window.location.pathname.includes('termos_de_uso.html');
    const isFaleConoscoPage = window.location.pathname.includes('fale_conosco.html');
    

    if (isIndexPage) {
        inicializarHeaderIndex();
        exibirProdutos(produtos);
        initBannerCarousel();
        setupDraggableCarousel(document.getElementById('lista-produtos'));
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const catalogoGrid = document.getElementById('lista-produtos');
        if (prevBtn && nextBtn && catalogoGrid) {
            const scrollStep = 300;
            nextBtn.addEventListener('click', () => catalogoGrid.scrollLeft += scrollStep);
            prevBtn.addEventListener('click', () => catalogoGrid.scrollLeft -= scrollStep);
        }
    } else {
        inicializarHeaderPaginaSecundaria();
    }
    
    if (isProductPage) {
        carregarDetalhesDoProduto();
        inicializarNewsletterCarousel();
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'), 10);

        const produto = produtos.find(p => p.id === id);
        if (!produto) {
            document.body.innerHTML = "<p>Produto não encontrado.</p>";
            return;
        }

        document.getElementById('main-product-image').src = produto.imagem;
        document.querySelector('.product-name').textContent = produto.nome;
        document.querySelector('.product-description').textContent = produto.descricao;
        document.querySelector('.product-material').textContent = produto.material;
        document.querySelector('.product-categoria').textContent = produto.categoria;
    } else if (isBlogPage) {
        displayArticles();
        // -------------------- Botão de cadastrar artigo -----------------------------
        // const createBtn = document.getElementById('create-article-btn');
        // if (createBtn) {
        //     createBtn.addEventListener('click', createNewArticle);
        // }
    } else if (isArticlePage) {
        carregarArtigo();
    } else if (isCreateArticlePage) {
        setupArticleForm();
    } else if (isFaqPage) {
        inicializarPaginaFaq();
    } else if (isPoliticaPage) {
        inicializarPaginaPolitica();
    } else if (isTermosPage) {
        inicializarPaginaTermos();
    } else if (isFaleConoscoPage) {
            inicializarPaginaFaleConosco();
    }

    const linkIntitucional = document.getElementById('link-institucional');
    if (linkIntitucional) {
        linkIntitucional.addEventListener('click', (event) => {
            event.preventDefault();
            carregarComponente('main-content-placeholder', 'institucional.html');
        });
    }
    
    inicializarAnimateOnScroll();
}


async function getRecaptchaToken(action = 'contact', timeout = 6000) {
  if (!window.RECAPTCHA_SITE_KEY) return null;
  const start = Date.now();
  while (!window.grecaptcha) {
    if (Date.now() - start > timeout) return null;
    await new Promise(r => setTimeout(r, 150));
  }
  try {
    await new Promise(resolve => window.grecaptcha.ready(resolve));
    const token = await window.grecaptcha.execute(window.RECAPTCHA_SITE_KEY, { action });
    return token || null;
  } catch (err) {
    console.warn('getRecaptchaToken falhou:', err);
    return null;
  }
}

// Bind para o formulário "Fale Conosco"
function bindContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  // cria feedback se não houver
  let feedback = document.getElementById('contact-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'contact-feedback';
    feedback.style.marginTop = '10px';
    form.appendChild(feedback);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    feedback.style.color = '';
    if (!name || !email || !message) {
      feedback.textContent = 'Por favor preencha nome, e-mail e mensagem.';
      feedback.style.color = 'red';
      return;
    }

    feedback.textContent = 'Enviando mensagem...';

    try {
      // tenta obter token reCAPTCHA se disponível
      let recaptchaToken = null;
      if (window.RECAPTCHA_SITE_KEY) {
        recaptchaToken = await getRecaptchaToken('contact', 6000);
        if (!recaptchaToken) console.warn('recaptchaToken não obtido para contact');
      }

      const payload = { name, email, message };
      if (recaptchaToken) payload.recaptchaToken = recaptchaToken;

      const res = await fetch('/api/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        feedback.style.color = '#b3ffd9';
        feedback.textContent = data.message || 'Mensagem enviada com sucesso.';
        form.reset();
      } else {
        feedback.style.color = '#ffd1d1';
        feedback.textContent = data.message || 'Erro ao enviar. Tente novamente mais tarde.';
        console.warn('send-contact erro:', res.status, data);
      }
    } catch (err) {
      console.error('Erro ao chamar /api/send-contact:', err);
      feedback.style.color = '#ffd1d1';
      feedback.textContent = 'Erro de conexão. Tente novamente.';
    }
  });
}

// chama bindContactForm quando inicializa a página de "Fale Conosco"
function inicializarPaginaFaleConosco() {
  console.log("Página Fale Conosco inicializada.");
  bindContactForm();
}


// Inicializa reCAPTCHA v3 se a site key estiver disponível via /api/config
async function initRecaptcha() {
    try {
        const res = await fetch('/api/config');
        const cfg = await res.json();
        if (cfg && cfg.recaptchaSiteKey) {
            window.RECAPTCHA_SITE_KEY = cfg.recaptchaSiteKey;
            // injeta o script do Google reCAPTCHA v3
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${cfg.recaptchaSiteKey}`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
            // garante que grecaptcha esteja pronto: chamamos grecaptcha.ready antes de usar
            script.addEventListener('load', () => {
                console.log('reCAPTCHA script carregado');
            });
        }
    } catch (err) {
        console.warn('Não foi possível inicializar reCAPTCHA:', err);
    }
}

(function handleNewsletterSidebarLinks() {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href="#newsletter"]');
    if (!link) return;

    e.preventDefault();

    const target = document.getElementById('newsletter');
    if (target) {
      // rolar suavemente até a seção existente e atualizar o hash sem pular
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try {
        history.replaceState(null, '', '#newsletter');
      } catch (err) { /* ignore */ }
    } else {
      // não existe na página atual -> redireciona para index.html#newsletter
      // ajuste o caminho se seu index estiver em outra rota
      window.location.href = 'index.html#newsletter';
    }
  }, false);
})();


// ...existing code...

/**
 * Scroll suave avançado: mantém a velocidade inicial do scroll,
 * mas suaviza a desaceleração no final, para uma sensação mais natural.
 * Chame esta função para rolar até targetY (em px) com duração e easing customizados.
 */
function scrollToTargetEasingCustom(targetY, duration = 200, easing = 'easeInOutCubic') {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easings = {
        linear: t => t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => 1 - Math.pow(1 - t, 3),
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    };

    const easeFn = easings[easing] || easings.easeInOutCubic;

    function animate(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = easeFn(t);
        window.scrollTo(0, startY + distance * eased);
        if (t < 1) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

// Aplica o scroll suave em todos os links âncora internos (ex: <a href="#secao">)
document.addEventListener('DOMContentLoaded', async () => {
    await inicializarPagina();

    // ativa micro-interações depois que a página foi inicializada
    try { initMicroInteractions(); } catch (e) { console.warn('initMicroInteractions falhou:', e); }

    document.querySelectorAll("a[href^='#']:not([href='#'])").forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                // Calcula a posição do topo do elemento
                const rect = target.getBoundingClientRect();
                const targetY = rect.top + window.scrollY;
                scrollToTargetEasingCustom(targetY, 200, 'easeInOutCubic');
                // Atualiza o hash na URL sem pular
                history.replaceState(null, '', `#${targetId}`);
            }
        });
    });
});

// ...existing code...

// ---------- Funções de cookies e geolocalização (adicionadas) ----------

function setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts.slice(1).join('=')) : r;
    }, null);
}

async function reverseGeocode(lat, lon) {
    try {
        // Use Nominatim (OpenStreetMap) para reverse geocoding sem chave
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'StikSite/1.0 (contact@stik.com)' } });
        if (!res.ok) throw new Error('status ' + res.status);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.county || null;
        const state = data.address.state || data.address.region || null;
        return { city, state, raw: data };
    } catch (err) {
        console.warn('reverseGeocode falhou:', err);
        return { city: null, state: null, raw: null };
    }
}

async function collectLocation() {
    // retorna {lat, lon, city, state}
    // primeiro tenta cookies/localStorage
    const cached = getCookie('stik_location');
    if (cached) {
        try { return JSON.parse(cached); } catch(e) { /* ignore */ }
    }

    // tenta geolocation do browser
    if (!('geolocation' in navigator)) {
        return { lat: null, lon: null, city: null, state: null };
    }

    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            // timeout -> retorna vazio
            resolve({ lat: null, lon: null, city: null, state: null });
        }, 10000);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            clearTimeout(timer);
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const geo = await reverseGeocode(lat, lon);
            const payload = { lat, lon, city: geo.city, state: geo.state };
            try { setCookie('stik_location', JSON.stringify(payload), 7); } catch(e) { /* ignore */ }
            resolve(payload);
        }, (err) => {
            clearTimeout(timer);
            console.warn('geolocation error:', err);
            resolve({ lat: null, lon: null, city: null, state: null });
        }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
    });
}

async function sendLocationToServer({ lat, lon, city, state }, toEmail) {
    try {
        const payload = { lat, lon, city, state };
        if (toEmail) payload.to = toEmail;
        const res = await fetch('/api/send-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) {
            console.warn('send-location falhou:', res.status, data);
            return { ok: false, status: res.status, data };
        }
        return { ok: true, status: res.status, data };
    } catch (err) {
        console.error('Erro ao enviar localização ao servidor:', err);
        return { ok: false, error: err };
    }
}

/**
 * collectAndSendLocation(toEmail)
 * - pede permissão de geolocalização, faz reverse-geocode, salva cookie e envia ao servidor
 * - toEmail é opcional e sobrescreve o destinatário configurado no servidor
 */
async function collectAndSendLocation(toEmail) {
    const loc = await collectLocation();
    const result = await sendLocationToServer(loc, toEmail);
    return { loc, result };
}

// expõe a função globalmente para uso em console ou botões
window.collectAndSendLocation = collectAndSendLocation;

// ---------- Fim das funções de localização ----------