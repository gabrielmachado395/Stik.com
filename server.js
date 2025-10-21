require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve arquivos estáticos (site)
app.use(express.static(path.join(__dirname)));

// helper para escapar HTML simples (proteção básica ao montar HTML)
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Rota para enviar mensagem do formulário "Fale Conosco"
app.post('/api/send-contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Por favor preencha nome, e-mail e mensagem.' });
  }

  // valida reCAPTCHA se configurado
  const recaptchaToken = req.body.recaptchaToken;
  if (process.env.RECAPTCHA_SECRET) {
    if (!recaptchaToken) {
      return res.status(400).json({ message: 'reCAPTCHA não provido.' });
    }
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
    const receiver = process.env.CONTACT_RECEIVER || process.env.FROM_EMAIL;
    const payload = {
      sender: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
      to: [{ email: receiver }],
      subject: `Contato via site: ${escapeHtml(name)}`,
      htmlContent: `
        <p>Você recebeu uma nova mensagem pelo formulário Fale Conosco:</p>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Mensagem:</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      `
    };

    console.log('Enviando contato para Brevo payload:', JSON.stringify({ to: payload.to, subject: payload.subject }));
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
    try { respJson = JSON.parse(respText); } catch(e){/* not json */ }

    if (!response.ok) {
      console.error('Brevo error (contact):', response.status, respText);
      const messageRes = 'Falha ao enviar mensagem.';
      if (process.env.DEBUG_API === 'true') {
        return res.status(502).json({ message: messageRes, status: response.status, detail: respJson || respText });
      }
      return res.status(502).json({ message: messageRes });
    }

    console.log('Brevo response (contact):', respText);
    return res.json({ message: 'Mensagem enviada com sucesso. Entraremos em contato em breve.', detail: respJson || respText });
  } catch (err) {
    console.error('Erro ao enviar e-mail via Brevo (contact):', err);
    return res.status(500).json({ message: 'Erro interno ao enviar mensagem.' });
  }
});


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

// Rota para enviar localização do usuário
app.post('/api/send-location', async (req, res) => {
  const { lat, lon, city, state, to } = req.body || {};

  if ((lat === undefined || lon === undefined) && !city && !state) {
    return res.status(400).json({ message: 'Dados de localização inválidos.' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ message: 'Servidor não configurado (falta BREVO_API_KEY).' });
  }

  try {
    const receiver = to || process.env.LOCATION_RECEIVER || process.env.CONTACT_RECEIVER || process.env.FROM_EMAIL;
    if (!receiver) {
      return res.status(500).json({ message: 'Nenhum destinatário configurado para envio de localização.' });
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '';

    const subject = 'Localização do usuário - Stik';
    const htmlContent = `
      <p>Recebemos dados de localização do usuário:</p>
      <ul>
        ${lat !== undefined && lon !== undefined ? `<li><strong>Latitude:</strong> ${escapeHtml(String(lat))}</li><li><strong>Longitude:</strong> ${escapeHtml(String(lon))}</li>` : ''}
        ${city ? `<li><strong>Cidade:</strong> ${escapeHtml(city)}</li>` : ''}
        ${state ? `<li><strong>Estado:</strong> ${escapeHtml(state)}</li>` : ''}
        <li><strong>IP:</strong> ${escapeHtml(String(ip))}</li>
      </ul>
    `;

    const payload = {
      sender: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
      to: [{ email: receiver }],
      subject,
      htmlContent
    };

    console.log('Enviando localização para Brevo payload:', JSON.stringify({ to: payload.to, subject: payload.subject }));
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
      console.error('Brevo error (location):', response.status, respText);
      const message = 'Falha ao enviar e-mail de localização.';
      if (process.env.DEBUG_API === 'true') {
        return res.status(502).json({ message, status: response.status, detail: respJson || respText });
      }
      return res.status(502).json({ message });
    }

    console.log('Brevo response (location):', respText);
    return res.json({ message: 'Localização enviada com sucesso.', detail: respJson || respText });
  } catch (err) {
    console.error('Erro ao enviar e-mail via Brevo (location):', err);
    return res.status(500).json({ message: 'Erro interno ao enviar e-mail de localização.' });
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
