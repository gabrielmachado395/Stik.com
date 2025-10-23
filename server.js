require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
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

// cria transporter nodemailer se variáveis SMTP estiverem configuradas
function createSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });
}

// função utilitária para enviar e-mail, decide entre SMTP (nodemailer) e Brevo API
async function sendEmail({ from, to, subject, html }) {
  // to can be array of addresses or single address
  const toList = Array.isArray(to) ? to : [to];

  // tenta SMTP primeiro se configurado
  const transporter = createSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `${from.name || ''} <${from.email}>`,
        to: toList.map(t => (typeof t === 'object' ? t.email || t : t)).join(','),
        subject,
        html
      });
      console.log('E-mail enviado via SMTP:', info && info.messageId);
      return { ok: true, via: 'smtp', info };
    } catch (err) {
      console.error('Erro ao enviar via SMTP, fallback para Brevo API se disponível:', err);
      // continua e tenta Brevo se configurado
    }
  }

  // fallback para Brevo API (REST) se chave presente
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    throw new Error('Nenhum método de envio configurado (SMTP or BREVO_API_KEY).');
  }

  const payload = {
    sender: { name: from.name || 'Stik', email: from.email || process.env.FROM_EMAIL || 'no-reply@stik.com' },
    to: toList.map(t => (typeof t === 'object' ? { email: t.email || t } : { email: t })),
    subject,
    htmlContent: html
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { }

  if (!response.ok) {
    const err = new Error('Falha no envio via Brevo API');
    err.status = response.status;
    err.detail = json || text;
    throw err;
  }

  console.log('E-mail enviado via Brevo API:', text);
  return { ok: true, via: 'brevo', detail: json || text };
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
    const html = `
        <p>Você recebeu uma nova mensagem pelo formulário Fale Conosco:</p>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Mensagem:</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      `;

    const result = await sendEmail({
      from: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
      to: receiver,
      subject: `Contato via site: ${escapeHtml(name)}`,
      html
    });

    return res.json({ message: 'Mensagem enviada com sucesso. Entraremos em contato em breve.', result });
  } catch (err) {
    console.error('Erro ao enviar e-mail via contact route:', err);
    const status = err.status || 500;
    const message = status === 500 ? 'Erro interno ao enviar mensagem.' : 'Falha ao enviar mensagem.';
    if (process.env.DEBUG_API === 'true') {
      return res.status(status).json({ message, detail: err.detail || err.message });
    }
    return res.status(status).json({ message });
  }
});


// Rota para enviar catálogo
app.post('/api/send-catalog', async (req, res) => {
    const { email } = req.body || {};
  const consent = req.body && (req.body.consent === true || req.body.consent === 'true');
    if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'E-mail inválido.' });
    }

  // valida consentimento explícito
  if (!consent) {
    return res.status(400).json({ message: 'Consentimento obrigatório para envio do catálogo. Marque a caixa de consentimento.' });
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
    // grava evidência do contato (email, timestamp, ip, consent) em data/contacts.csv para auditoria
    try {
      const fs = require('fs');
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      const csvPath = path.join(dataDir, 'contacts.csv');
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '';
      const timestamp = new Date().toISOString();
      const row = `${email.replace(/"/g, '""')},${timestamp},${ip},${consent ? 'true' : 'false'},catalog`;
      if (!fs.existsSync(csvPath)) {
        fs.writeFileSync(csvPath, 'email,timestamp,ip,consent,source\n' + row + '\n', { encoding: 'utf8' });
      } else {
        fs.appendFileSync(csvPath, row + '\n', { encoding: 'utf8' });
      }
    } catch (err) {
      console.error('Falha ao salvar contato localmente:', err);
      // não bloqueia o fluxo de envio, apenas registra o problema
    }
        // Monta payload para a API de SMTP transactional (senders) da Brevo
        // Usamos a endpoint /smtp/email da Brevo (REST)
        const payload = {
            sender: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
            to: [{ email }],
            subject: 'Seu catálogo Stik',
            htmlContent: `<p>Olá,</p><p>Obrigado pelo interesse. Clique no link abaixo para baixar nosso catálogo.</p><p><a href="${process.env.CATALOG_URL || '/catalogo.html'}">Baixar Catálogo</a></p><p>Atenciosamente,<br/>Stik</p>`
        };

    const html = `<p>Olá,</p><p>Obrigado pelo interesse. Clique no link abaixo para baixar nosso catálogo.</p><p><a href="${process.env.CATALOG_URL || '/catalogo.html'}">Baixar Catálogo</a></p><p>Atenciosamente,<br/>Stik</p>`;

    const result = await sendEmail({
      from: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
      to: email,
      subject: 'Seu catálogo Stik',
      html
    });

    return res.json({ message: 'E-mail enviado com sucesso.', result });
    } catch (err) {
    console.error('Erro ao enviar e-mail via catalog route:', err);
    const status = err.status || 500;
    const message = status === 500 ? 'Erro interno ao enviar e-mail.' : 'Falha ao enviar e-mail.';
    if (process.env.DEBUG_API === 'true') {
      return res.status(status).json({ message, detail: err.detail || err.message });
    }
    return res.status(status).json({ message });
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
      htmlContent: htmlContent
    };

    console.log('Enviando localização, tentando enviar via sendEmail (SMTP/Brevo)');
    try {
      const result = await sendEmail({
        from: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
        to: receiver,
        subject,
        html: htmlContent
      });

      return res.json({ message: 'Localização enviada com sucesso.', result });
    } catch (err) {
      console.error('Erro ao enviar localização via sendEmail:', err);
      const status = err.status || 500;
      const message = status === 500 ? 'Erro interno ao enviar e-mail de localização.' : 'Falha ao enviar e-mail de localização.';
      if (process.env.DEBUG_API === 'true') {
        return res.status(status).json({ message, detail: err.detail || err.message });
      }
      return res.status(status).json({ message });
    }
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
  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
  res.json({
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || null,
    smtpConfigured,
    smtpHost: process.env.SMTP_HOST || null
  });
});
