# Publicar na Hostinger

Este site é 100% estático (HTML + CSS + JS). Funciona em qualquer plano Hostinger com hospedagem web.

## Arquivos para enviar

```
public_html/
├── index.html
├── styles.css
├── app.js
└── assets/
    └── luiza.jpg
```

Também há um ZIP pronto na sua Área de Trabalho: `vaquinha-hostinger.zip`

## Passo a passo (Gerenciador de Arquivos)

1. Acesse [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Vá em **Sites** → selecione seu domínio
3. Abra **Gerenciador de Arquivos** (File Manager)
4. Entre na pasta **`public_html`**
   - Se for um subdomínio ou pasta específica, use a pasta correspondente
5. **Apague** arquivos padrão da Hostinger se quiser (ex: `default.php`), ou mantenha se não conflitar
6. Clique em **Upload** e envie o `vaquinha-hostinger.zip`
7. Clique com o botão direito no ZIP → **Extrair** (Extract)
8. Confirme que a estrutura ficou assim:
   - `public_html/index.html` (não dentro de uma subpasta extra!)
9. Acesse seu domínio no navegador

## Passo a passo (FTP — FileZilla)

1. No hPanel: **Arquivos** → **Contas FTP** → anote host, usuário e senha
2. No FileZilla, conecte com esses dados
3. No servidor, abra `public_html`
4. Arraste estes arquivos do seu computador:
   - `index.html`
   - `styles.css`
   - `app.js`
   - pasta `assets/` (com `luiza.jpg` dentro)

## Domínio ou subpasta?

| Onde colocar | URL final |
|---|---|
| `public_html/` | `seudominio.com` |
| `public_html/vaquinha/` | `seudominio.com/vaquinha` |

## SSL (HTTPS)

No hPanel: **Segurança** → **SSL** → ative o certificado gratuito (Let's Encrypt).  
A Hostinger geralmente ativa automaticamente em domínios novos.

## Problemas comuns

**Página em branco ou 403**  
→ Confirme que `index.html` está direto em `public_html`, não em `public_html/vaquinha-hostinger/`

**Foto da Luiza não aparece**  
→ A pasta `assets/` precisa estar no mesmo nível que `index.html`

**CSS/JS não carrega**  
→ Verifique se `styles.css` e `app.js` foram enviados junto com o `index.html`

## Atualizar o site depois

Sempre que mudar algo localmente, reenvie os arquivos alterados por FTP ou pelo Gerenciador de Arquivos (substitua os antigos).
