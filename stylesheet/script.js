// Dados
const produtos = [
    {
        id: 1,
        nome: "Carícia",
        categoria: "Base",
        imagem: "./img/Base/caricia-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 2,
        nome: "Canoa",
        categoria: "Elásticos Crus",
        imagem: "./img/Elastícos Crus/canoa-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 3,
        nome: "Cinta",
        categoria: "Modeladores",
        imagem: "./img/Modeladores/cinta-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Políester", 
    },
    {
        id: 4,
        nome: "Atena",
        categoria: "Personalizados",
        imagem: "./img/Personalizados/alcaatena-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 5,
        nome: "Belly",
        categoria: "Premium",
        imagem: "./img/Premium/belly-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 6,
        nome: "Ana",
        categoria: "Rendas",
        imagem: "./img/Renda/ana-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 7,
        nome: "Magno",
        categoria: "Alças",
        imagem: "./img/Alças/magno-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 8,
        nome: "Flor",
        categoria: "Lançamento de Elástico",
        imagem: "img/flor-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 9,
        nome: "Grécia",
        categoria: "Lançamento de Alça",
        imagem: "img/grecia-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 10,
        nome: "Diana",
        categoria: "Lançamento de Base",
        imagem: "img/diana-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 11,
        nome: "Ágda",
        categoria: "Viés",
        imagem: "img/agda-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 12,
        nome: "Atlas",
        categoria: "Com Arco",
        imagem: "img/atlas-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 13,
        nome: "Eros",
        categoria: "Lançamento de Viés",
        imagem: "img/eros-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 14,
        nome: "Chll",
        categoria: "Premium",
        imagem: "img/chll-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 15,
        nome: "Ana",
        categoria: "Rendas",
        imagem: "img/ana-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
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
        searchBox.classList.toggle('is-active');
        if (searchBox.classList.contains('is-active')) {
            searchInput.focus();
        } else {
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
            searchBox.classList.remove('is-active');
            limparPesquisa();
        }
    });

    function limparPesquisa() {
        searchResultsList.innerHTML = '';
        searchInput.value = '';
        searchBox.classList.remove('has-results');
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
        })
        .catch(error => console.error('Erro ao carregar catálogo:', error));
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

document.addEventListener('DOMContentLoaded', inicializarPagina);