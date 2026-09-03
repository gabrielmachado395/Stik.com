(function () {
    const blockedPaths = [
        /\/admin(\.html)?$/,
        /\/create-article(\.html)?$/
    ];
    const pathname = window.location.pathname.replace(/\/+$/, '');
    const isBlockedPath = blockedPaths.some(pattern => pattern.test(pathname));
    const isLocalHost = ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname);

    if (!isBlockedPath || isLocalHost) return;

    window.STIK_ADMIN_FRONTEND_BLOCKED = true;

    try {
        localStorage.removeItem('stik.admin.session');
    } catch (error) {
        /* O bloqueio deve continuar mesmo sem acesso ao storage. */
    }

    const style = document.createElement('style');
    style.textContent = `
        body > :not(.stik-admin-block-screen) {
            display: none !important;
        }

        .stik-admin-block-screen {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 32px;
            background: #101820;
            color: #f7f1e8;
            font-family: Arial, sans-serif;
        }

        .stik-admin-block-card {
            width: min(100%, 520px);
            padding: 28px;
            border: 1px solid rgba(247, 241, 232, 0.18);
            background: #172331;
            border-radius: 8px;
            box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
        }

        .stik-admin-block-card span {
            display: block;
            margin-bottom: 10px;
            color: #edc77c;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0;
            text-transform: uppercase;
        }

        .stik-admin-block-card h1 {
            margin: 0 0 12px;
            font-size: 28px;
            line-height: 1.15;
        }

        .stik-admin-block-card p {
            margin: 0;
            color: #d8e0ea;
            font-size: 16px;
            line-height: 1.55;
        }
    `;
    document.head.appendChild(style);

    function renderBlockedScreen() {
        document.body.innerHTML = `
            <main class="stik-admin-block-screen">
                <section class="stik-admin-block-card" aria-labelledby="stik-admin-block-title">
                    <span>Area interna</span>
                    <h1 id="stik-admin-block-title">Acesso indisponivel</h1>
                    <p>Esta tela administrativa esta bloqueada no ambiente publico.</p>
                </section>
            </main>
        `;
    }

    if (document.body) {
        renderBlockedScreen();
    } else {
        document.addEventListener('DOMContentLoaded', renderBlockedScreen, { once: true });
    }
})();
