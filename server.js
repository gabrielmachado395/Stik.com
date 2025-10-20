require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve arquivos estáticos (site)
app.use(express.static(path.join(__dirname)));

// Rota para enviar catálogo
app.post('/api/send-catalog', async (req, res) => {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'E-mail inválido.' });
    }

    // valida reCAPTCHA se configurado
    const recaptchaToken = req.body.recaptchaToken;
    if (process.env.RECAPTCHA_SECRET) {
        if (!recaptchaToken) {
            return res.status(400).json({ message: 'reCAPTCHA não provido.' });
        }

        // valida com a API do Google
        try {
            const params = new URLSearchParams();
            params.append('secret', process.env.RECAPTCHA_SECRET);
            params.append('response', recaptchaToken);

            const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });
            const verification = await r.json();
            if (!verification.success || (verification.score !== undefined && verification.score < 0.3)) {
                console.error('reCAPTCHA falhou:', verification);
                return res.status(403).json({ message: 'Falha na verificação reCAPTCHA.' });
            }
        } catch (err) {
            console.error('Erro ao verificar reCAPTCHA:', err);
            return res.status(500).json({ message: 'Erro ao verificar reCAPTCHA.' });
        }
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
        return res.status(500).json({ message: 'Servidor não configurado (falta BREVO_API_KEY).' });
    }

    try {
        // Monta payload para a API de SMTP transactional (senders) da Brevo
        // Usamos a endpoint /smtp/email da Brevo (REST)
        const payload = {
            sender: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
            to: [{ email }],
            subject: 'Seu catálogo Stik',
            htmlContent: `<p>Olá,</p><p>Obrigado pelo interesse. Clique no link abaixo para baixar nosso catálogo.</p><p><a href="${process.env.CATALOG_URL || '/catalogo.html'}">Baixar Catálogo</a></p><p>Atenciosamente,<br/>Stik</p>`
        };

        console.log('Enviando para Brevo payload:', JSON.stringify(payload));
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify(payload)
        });

        const respText = await response.text();
        let respJson = null;
        try { respJson = JSON.parse(respText); } catch(e){/* not json */}

        if (!response.ok) {
            console.error('Brevo error:', response.status, respText);
            const message = 'Falha ao enviar e-mail.';
            // se debug ativado, retorna detalhes
            if (process.env.DEBUG_API === 'true') {
                return res.status(502).json({ message, status: response.status, detail: respJson || respText });
            }
            return res.status(502).json({ message });
        }

        console.log('Brevo response:', respText);
        return res.json({ message: 'E-mail enviado com sucesso.', detail: respJson || respText });
    } catch (err) {
        console.error('Erro ao enviar e-mail via Brevo:', err);
        return res.status(500).json({ message: 'Erro interno ao enviar e-mail.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
});

// rota para expor configurações públicas (ex.: site key do reCAPTCHA)
app.get('/api/config', (req, res) => {
    res.json({
        recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || null
    });
});
