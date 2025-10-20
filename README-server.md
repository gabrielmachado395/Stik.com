Instalação e execução do servidor local para envio de catálogo via Brevo

1) Instalar dependências

No PowerShell (Windows):

    npm install

2) Configurar variáveis de ambiente

Copie `.env.example` para `.env` e coloque sua chave da Brevo em `BREVO_API_KEY`.

reCAPTCHA (opcional, recomendado)
 - Crie chaves em https://www.google.com/recaptcha/admin (recomendo reCAPTCHA v3)
 - Adicione `RECAPTCHA_SITE_KEY` e `RECAPTCHA_SECRET` no `.env` para ativar validação

3) Rodar o servidor

No PowerShell:

    npm start

O servidor servirá os arquivos estáticos do site e exporá a rota POST `/api/send-catalog`.

Observação de segurança: NÃO comite sua chave real no repositório.

    Debug e testes (PowerShell)
    - Ativar debug mais verboso (exibe detalhe retornado pela Brevo): adicione no `.env`

        DEBUG_API=true

    - Testar com um comando PowerShell (substitua email@example.com):

        Invoke-RestMethod -Uri http://localhost:3000/api/send-catalog -Method Post -Body (@{ email='seu@email.com'} | ConvertTo-Json) -ContentType 'application/json'

    - Se quiser enviar também um token reCAPTCHA (quando configurado):

        Invoke-RestMethod -Uri http://localhost:3000/api/send-catalog -Method Post -Body (@{ email='seu@email.com'; recaptchaToken='TOKEN_AQUI'} | ConvertTo-Json) -ContentType 'application/json'

    - Logs: ao rodar `npm start`, copie a saída do terminal (console) e cole aqui se quiser que eu analise. Procure linhas com 'Brevo error' ou 'Enviando para Brevo payload'.

