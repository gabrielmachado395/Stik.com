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

// --- Funções Auxiliares ---

// Cria um card de produto
function criarProdutoCard(produto) {
    // AQUI: Cria um link <a> em vez de uma div <div>
    const produtoCard = document.createElement('a'); 
    produtoCard.classList.add('produto-card');

    // AQUI: Define o href para a página de produto com o ID
    produtoCard.href = `produto.html?id=${produto.id}`; 
    
    // O conteúdo HTML interno permanece o mesmo
    produtoCard.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}">
        <h3>${produto.nome}</h3>
    `;
    return produtoCard;
}

// O restante do seu código JavaScript continua igual
function exibirProdutos() {
    const listaProdutosContainer = document.getElementById('lista-produtos');
    if (!listaProdutosContainer) return;

    listaProdutosContainer.innerHTML = '';
    
    produtos.forEach(produto => {
        const card = criarProdutoCard(produto);
        listaProdutosContainer.appendChild(card);
    });
}


// Configura um carrossel para ser arrastável
function setupDraggableCarousel(carouselElement) {
    if (!carouselElement) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    carouselElement.addEventListener('mousedown', (e) => {
        isDown = true;
        carouselElement.classList.add('active');
        startX = e.pageX - carouselElement.offsetLeft;
        scrollLeft = carouselElement.scrollLeft;
    });

    carouselElement.addEventListener('mouseleave', () => {
        isDown = false;
        carouselElement.classList.remove('active');
    });

    carouselElement.addEventListener('mouseup', () => {
        isDown = false;
        carouselElement.classList.remove('active');
    });

    carouselElement.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carouselElement.offsetLeft;
        const walk = (x - startX) * 2;
        carouselElement.scrollLeft = scrollLeft - walk;
    });
}

function carregarDetalhesDoProduto() {
    // 1. Obter o ID do prouduto da URL
    const params = new URLSearchParams(window.location.search);
    const produtoId = parseInt(params.get('id'));

    // 2. Econtrar o produto no array
    const produto = produtos.find(p => p.id === produtoId);

    if (produto) {
        // 3. Preencher a página com os dados do produto
        document.getElementById('main-product-image').src = produto.imagem;
        document.querySelector('.product-name').textContent = produto.nome;
        document.querySelector('.product-category').textContent = produto.categoria;
        document.querySelector('.product-description').textContent = produto.descricao;
        document.querySelector('.product-material').textContent = produto.material;

        // Limpar as variações existentes
        const variationOptions = document.querySelector('.variation-options');
        variationOptions.innerHTML = '';

        // Criar e adicionar as miniaturas de variações
        produto.variacoes.forEach(variacao => {
            const img = document.createElement('img');
            img.src = variacao.imagem;
            img.alt = variacao.nome;
            img.classList.add('variation-thumbnail');
            img.addEventListener('click', () => {
                document.getElementById('main-product-image').src = variacao.imagem;
            });
            variationOptions.appendChild(img);
        });
    } else {
        // Tratar o caso de produto não encontrado
        // Você pode redirecionar para uma página de erro ou para a home
        console.error("Produto não encontrado.");
        // window.location.href = "main.html";
    }
}

// --- Lógica do Carrossel de Banner ---
const bannerImages = [
    { src: "./img/banner/banner-site-8_Prancheta-1-scaled (1).jpg", alt: 'Elásticos para a sua confecção de moda fitness' },
    { src: "./img/banner/banner-site-10_Prancheta-1-scaled.jpg", alt: 'Renda-se aos nossos encantos!' },
    { src: "./img/banner/banner-site-11_Prancheta-1-scaled.jpg", alt: 'Catálogo Virtual' },
];

function initBannerCarousel() {
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
    
    // Configura o arrastar para o carrossel do banner
    setupDraggableCarousel(mainBannerTrack);
}


// A função para carregar a sidebar e o footer deve ser feita em todas as páginas,
// então vamos criar uma função geral para isso.
function carregarPartesComuns() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        fetch('header.html')
            .then(response => response.text())
            .then(html => headerPlaceholder.innerHTML = html);
    }
    if (sidebarPlaceholder) {
        fetch('sidebar.html')
            .then(response => response.text())
            .then(html => {
                sidebarPlaceholder.innerHTML = html;
                inicializarSidebar();
                // Associa o botão do blog após a sidebar ser carregada
                const blogLink = document.getElementById('blog-link');
                if (blogLink) {
                    blogLink.href = 'blog.html';
                }
            });
    }
    if (footerPlaceholder) {
        fetch('footer.html')
            .then(response => response.text())
            .then(html => {
                footerPlaceholder.innerHTML = html;
                // Associa o botão do blog no footer
                const footerBlogLink = document.getElementById('footer-blog-link');
                if (footerBlogLink) {
                    footerBlogLink.href = 'blog.html';
                }
            });
    }
}

function inicializarSidebar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (menuToggle && sidebar && overlay && closeSidebar) {
        function openSidebar() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebarFn() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        menuToggle.addEventListener('click', openSidebar);
        closeSidebar.addEventListener('click', closeSidebarFn);
        overlay.addEventListener('click', closeSidebarFn);
    }
}

// Funções para o blog
function createNewArticle() {
    // Redireciona para a página de criação de artigo
    window.location.href = 'create-article.html';
}

function createArticleCard(article) {
    const card = document.createElement('a');
    card.href = `article.html?id=${article.id}`;
    card.classList.add('article-card');

    const firstImage = article.content.match(/<img[^>]+src="([^">]+)"/);
    const imageUrl = firstImage ? firstImage[1] : './img/default-blog.png'; // Imagem padrão

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

    // Acessar os artigos salvos no localStorage (ou API)
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
        window.location.href = 'blog.html'; // Redireciona de volta para a lista de artigos
    });
}

// --- Lógica Principal ---
document.addEventListener('DOMContentLoaded', () => {
    // Carregar partes comuns (Header, Sidebar, Footer)
    carregarPartesComuns();

    // Lógica específica para cada página
    const isBlogPage = window.location.pathname.includes('blog.html');
    const isCreateArticlePage = window.location.pathname.includes('create-article.html');

    if (isBlogPage) {
        displayArticles();
        const createBtn = document.getElementById('create-article-btn');
        if (createBtn) {
            createBtn.addEventListener('click', createNewArticle);
        }
    } else if (isCreateArticlePage) {
        setupArticleForm();
    }   
    // --- Lógica da Sidebar ---
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');    
    
    if (menuToggle && sidebar && overlay && closeSidebar) {
        function openSidebar() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebarFn() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        menuToggle.addEventListener('click', openSidebar);
        closeSidebar.addEventListener('click', closeSidebarFn);
        overlay.addEventListener('click', closeSidebarFn);
    }
    
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

    // --- Animação de aparecer ao rolar (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });

    // --- Lógica para o botão de modo claro/escuro ---
    const themeToggleButton = document.querySelector('.header-right .fa-sun, .header-right .fa-moon');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            if (themeToggleButton.classList.contains('fa-sun')) {
                themeToggleButton.classList.remove('fa-sun');
                themeToggleButton.classList.add('fa-moon');
            } else {
                themeToggleButton.classList.remove('fa-moon');
                themeToggleButton.classList.add('fa-sun');
            }
        });
    }

    // --- Inicialização ---
    // Esta é a parte corrigida. Agora o código sabe em que página está.
    const isProductPage = window.location.pathname.includes('produto.html');
    const isMainPage = window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname.includes('main.html');
    
    if (isMainPage) {
        exibirProdutos();
        initBannerCarousel();

        // Lógica do carrossel de produtos (com rolagem arrastável e botões)
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const catalogoGrid = document.getElementById('lista-produtos');
        
        if (prevBtn && nextBtn && catalogoGrid) {
            const scrollStep = 300;
            nextBtn.addEventListener('click', () => {
                catalogoGrid.scrollLeft += scrollStep;
            });
            prevBtn.addEventListener('click', () => {
                catalogoGrid.scrollLeft -= scrollStep;
            });
        }
        setupDraggableCarousel(catalogoGrid);

        // Lógica para o cabeçalho fixo na página principal
        const topHeader = document.getElementById('mainHeader');
        const videoHeroSection = document.querySelector('.video-hero-section');
        function updateHeaderVisibility() {
            if (!topHeader || !videoHeroSection) return;

            const scrolledPastVideo = window.scrollY > (videoHeroSection.clientHeight - 100);

            if (scrolledPastVideo) {
                topHeader.classList.remove('is-hidden');
                topHeader.classList.add('is-visible', 'scrolled');
            } else {
                topHeader.classList.remove('is-visible', 'scrolled');
                topHeader.classList.add('is-hidden');
            }
        }
        if (topHeader && videoHeroSection) {
            topHeader.addEventListener('mouseenter', () => {
                if (window.scrollY < videoHeroSection.clientHeight) {
                    topHeader.classList.remove('is-hidden');
                    topHeader.classList.add('is-visible');
                }
            });
            topHeader.addEventListener('mouseleave', () => {
                if (window.scrollY < videoHeroSection.clientHeight) {
                    topHeader.classList.remove('is-visible');
                    topHeader.classList.add('is-hidden');
                }
            });
            window.addEventListener('scroll', updateHeaderVisibility);
            updateHeaderVisibility();
        }
    } 
    
    if (isProductPage) {
        carregarDetalhesDoProduto();
        // Lógica para o cabeçalho fixo na página de produto
        const topHeader = document.getElementById('mainHeader');
        if (topHeader) {
            topHeader.classList.remove('is-hidden');
            topHeader.classList.add('is-visible', 'scrolled');
        }
    }
});