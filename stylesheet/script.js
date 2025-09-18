// Dados
const produtos = [
    {
        id: 1,
        nome: "Base",
        imagem: "./img/Base/caricia-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 2,
        nome: "Elásticos Crus",
        imagem: "./img/Elastícos Crus/canoa-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 3,
        nome: "Modeladores",
        imagem: "./img/Modeladores/cinta-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 4,
        nome: "Personalizados",
        imagem: "./img/Personalizados/alcaatena-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 5,
        nome: "Premium",
        imagem: "./img/Premium/belly-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 6,
        nome: "Rendas",
        imagem: "./img/Renda/ana-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
    {
        id: 7,
        nome: "Alças",
        imagem: "./img/Alças/magno-stik.png",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        material: "Elástico",
    },
];

// Funções para carregar e inicializar componentes
async function carregarComponente(id, url) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;

    try {
        const response = await fetch(url);
        const html = await response.text();
        placeholder.innerHTML = html;
    } catch (error) {
        console.error(`Erro ao carregar o componente ${url}:`, error);
    }
}

// Lógica de Inicialização do Menu e Overlay
function inicializarMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (menuToggle && sidebar && overlay && closeSidebar) {
        const openSidebar = () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeSidebarFn = () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        menuToggle.addEventListener('click', openSidebar);
        closeSidebar.addEventListener('click', closeSidebarFn);
        overlay.addEventListener('click', closeSidebarFn);
    }
}

// Lógica de Inicialização dos Submenus
function inicializarSubmenus() {
    const submenuLinks = document.querySelectorAll('.has-submenu > .sidebar-link, .has-submenu-hover > .sidebar-link');
    submenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const submenu = link.nextElementSibling;
            if (submenu) {
                submenu.classList.toggle('active');
                const icon = link.querySelector('.fas.fa-chevron-down, .fas.fa-chevron-right');
                if (icon) {
                    if (icon.classList.contains('fa-chevron-down')) {
                        icon.classList.toggle('fa-rotate-180');
                    } else {
                        icon.classList.toggle('fa-rotate-90');
                    }
                }
            }
        });
    });
}

function inicializarModoClaro() {
    const themeToggleButton = document.querySelector('.icon-btn[aria-label="Modo Claro/Escuro"]');
    
    // 1. Carregar a preferência salva ao carregar a página
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light-mode') {
        document.body.classList.add('light-mode');
        // Atualiza o ícone ao carregar, se o tema for claro
        const icon = themeToggleButton.querySelector('i');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            // 2. Alterna o tema
            document.body.classList.toggle('light-mode');
            
            const icon = themeToggleButton.querySelector('i');
            
            // 3. Atualiza o ícone e salva a preferência no localStorage
            if (document.body.classList.contains('light-mode')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light-mode'); // Salva o tema claro
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark-mode');  // Salva o tema escuro
            }
        });
    }
}

// Lógica do header da página inicial
function inicializarHeaderIndex() {
    const topHeader = document.getElementById('mainHeader');
    const videoHeroSection = document.querySelector('.video-hero-section');
    const headerHoverArea = document.getElementById('header-hover-area');
    
    if (!topHeader || !videoHeroSection || !headerHoverArea) {
        return;
    }

    headerHoverArea.addEventListener('mouseenter', () => {
        topHeader.classList.remove('is-hidden');
        topHeader.classList.add('is-visible');
    });

    headerHoverArea.addEventListener('mouseleave', () => {
        if (window.scrollY < (videoHeroSection.clientHeight - 100)) {
            topHeader.classList.remove('is-visible');
            topHeader.classList.add('is-hidden');
        }
    });
    
    const updateHeaderOnScroll = () => {
        const scrolledPastVideo = window.scrollY > (videoHeroSection.clientHeight - 100);
        if (scrolledPastVideo) {
            topHeader.classList.remove('is-hidden');
            topHeader.classList.add('is-visible', 'scrolled');
        } else {
            if (!headerHoverArea.matches(':hover')) {
                topHeader.classList.remove('is-visible', 'scrolled');
                topHeader.classList.add('is-hidden');
            }
        }
    };
    
    window.addEventListener('scroll', updateHeaderOnScroll);
    updateHeaderOnScroll();
}

// Lógica do header de páginas secundárias
function inicializarHeaderPaginaSecundaria() {
    const topHeader = document.getElementById('mainHeader');
    if (topHeader) {
        topHeader.classList.add('is-visible', 'scrolled');
        topHeader.classList.remove('is-hidden');
    }
}

// Funções para a página inicial
function criarProdutoCard(produto) {
    const produtoCard = document.createElement('a'); 
    produtoCard.classList.add('produto-card');
    produtoCard.href = `produto.html?id=${produto.id}`;
    
    produtoCard.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}">
        <h3>${produto.nome}</h3>
    `;
    return produtoCard;
}

function exibirProdutos() {
    const listaProdutosContainer = document.getElementById('lista-produtos');
    if (!listaProdutosContainer) return;
    
    listaProdutosContainer.innerHTML = '';
    
    produtos.forEach(produto => {
        const card = criarProdutoCard(produto);
        listaProdutosContainer.appendChild(card);
    });
}

function setupDraggableCarousel(carouselElement) {
    if (!carouselElement) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    
    const startDrag = (e) => {
        isDown = true;
        carouselElement.classList.add('active');
        startX = e.pageX || e.touches[0].pageX;
        scrollLeft = carouselElement.scrollLeft;
    };

    const endDrag = () => {
        isDown = false;
        carouselElement.classList.remove('active');
    };

    const drag = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX || e.touches[0].pageX;
        const walk = (x - startX) * 2;
        carouselElement.scrollLeft = scrollLeft - walk;
    };
    
    carouselElement.addEventListener('mousedown', startDrag);
    carouselElement.addEventListener('mouseleave', endDrag);
    carouselElement.addEventListener('mouseup', endDrag);
    carouselElement.addEventListener('mousemove', drag);
    
    // Adicionar suporte a toque para dispositivos móveis
    carouselElement.addEventListener('touchstart', (e) => startDrag(e));
    carouselElement.addEventListener('touchend', endDrag);
    carouselElement.addEventListener('touchcancel', endDrag);
    carouselElement.addEventListener('touchmove', (e) => drag(e));
}

// Lógica para o carrossel de banner
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

// Funções para o blog
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

function displayArticles() {
    const articlesContainer = document.getElementById('articles-list');
    if (!articlesContainer) return;
    
    const articles = JSON.parse(localStorage.getItem('blogArticles')) || [];
    articlesContainer.innerHTML = '';
    
    articles.forEach(article => {
        const card = createArticleCard(article);
        articlesContainer.appendChild(card);
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

// Funções para a página do produto
function carregarDetalhesDoProduto() {
    const params = new URLSearchParams(window.location.search);
    const produtoId = parseInt(params.get('id'));
    const produto = produtos.find(p => p.id === produtoId);

    if (produto) {
        document.getElementById('main-product-image').src = produto.imagem;
        document.querySelector('.product-name').textContent = produto.nome;
        // As propriedades 'categoria' e 'variacoes' não existem no seu array, por isso foram comentadas
        // document.querySelector('.product-category').textContent = produto.categoria;
        document.querySelector('.product-description').textContent = produto.descricao;
        document.querySelector('.product-material').textContent = produto.material;

        const variationOptions = document.querySelector('.variation-options');
        if (variationOptions) {
            variationOptions.innerHTML = '';
            //produto.variacoes.forEach(variacao => {
            //    const img = document.createElement('img');
            //    img.src = variacao.imagem;
            //    img.alt = variacao.nome;
            //    img.classList.add('variation-thumbnail');
            //    img.addEventListener('click', () => {
            //        document.getElementById('main-product-image').src = variacao.imagem;
            //    });
            //    variationOptions.appendChild(img);
            //});
        }
    } else {
        console.error("Produto não encontrado.");
    }
}

// Inicialização do carrossel de newsletter
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

// Lógica de Animação ao Rolar (Intersection Observer)
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

// Função principal de inicialização da página
async function inicializarPagina() {
    const isIndexPage = window.location.pathname.includes('index.html');
    const isProductPage = window.location.pathname.includes('produto.html');
    const isBlogPage = window.location.pathname.includes('blog.html');
    const isCreateArticlePage = window.location.pathname.includes('create-article.html');

    // Carregar componentes fixos
    await carregarComponente('header-placeholder', 'header.html');
    await carregarComponente('sidebar-placeholder', 'sidebar.html');
    await carregarComponente('footer-placeholder', 'footer.html');

    // Inicializar lógica de componentes globais
    inicializarMenu();
    inicializarSubmenus();
    inicializarModoClaro();

    // Inicializar lógica específica de página
    if (isIndexPage) {
        inicializarHeaderIndex();
        exibirProdutos();
        initBannerCarousel();
        setupDraggableCarousel(document.getElementById('lista-produtos'));
        // Botões do carrossel do catálogo
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
    
    // Lógica para outras páginas
    if (isProductPage) {
        carregarDetalhesDoProduto();
    } else if (isBlogPage) {
        displayArticles();
        const createBtn = document.getElementById('create-article-btn');
        if (createBtn) {
            createBtn.addEventListener('click', createNewArticle);
        }
    } else if (isCreateArticlePage) {
        setupArticleForm();
    }

    // Ações para o link institucional na sidebar (agora que ela está carregada)
    const linkIntitucional = document.getElementById('link-institucional');
    if (linkIntitucional) {
        linkIntitucional.addEventListener('click', (event) => {
            event.preventDefault();
            carregarComponente('main-content-placeholder', 'institucional.html');
        });
    }

    // Inicializar animações em qualquer página
    inicializarAnimateOnScroll();
    
    // Inicializar carrossel de newsletter (no arquivo catalogo.html)
    inicializarNewsletterCarousel();
}

// Iniciar tudo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarPagina);