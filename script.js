/* ==========================================================================
   script.js — lógica do catálogo
   --------------------------------------------------------------------------
   Depende de js/products.js (CONFIG, PRODUTOS).
   Sem backend: os dados vêm de um array em memória.

   >>> COMO MIGRAR PARA UMA API NO FUTURO
   Troque a função carregarProdutos() por algo assim e nada mais muda:

       async function carregarProdutos() {
         const r = await fetch('https://api.sualoja.com/produtos');
         if (!r.ok) throw new Error('Falha ao carregar o estoque');
         return await r.json();   // mesma estrutura de PRODUTOS
       }

   O restante do arquivo (filtros, cards, WhatsApp) continua igual.
   ========================================================================== */

'use strict';

/* ---------------- Fonte de dados (troque por fetch no futuro) ------------- */
function carregarProdutos() {
  return PRODUTOS.map(function (p) { return Object.assign({}, p); });
}

let estoque = [];
let comparar = [];   /* ids marcados no comparador (máx. 3) */
const MAX_COMPARAR = 3;

/* ---------------- Rótulos e cores ---------------------------------------- */
const STATUS = {
  disponivel: { rotulo: 'Disponível', classe: 'st-ok' },
  reservado:  { rotulo: 'Reservado',  classe: 'st-hold' },
  vendido:    { rotulo: 'Vendido',    classe: 'st-out' }
};

/* Cores usadas para desenhar o aparelho quando não há foto.
   Para uma cor nova, basta acrescentar aqui. */
const CORES = {
  'preto':    { corpo: '#2a2d31', borda: '#15171a' },
  'grafite':  { corpo: '#4b4e52', borda: '#2a2c2f' },
  'branco':   { corpo: '#ececea', borda: '#c9c9c6' },
  'prata':    { corpo: '#dfe3e7', borda: '#b7bdc4' },
  'azul':     { corpo: '#5b82a6', borda: '#3a5a78' },
  'verde':    { corpo: '#4e6157', borda: '#33423a' },
  'roxo':     { corpo: '#6f5f8d', borda: '#4a3e63' },
  'rosa':     { corpo: '#d8b3b6', borda: '#b28e92' },
  'vermelho': { corpo: '#a83a3f', borda: '#7c262b' },
  'amarelo':  { corpo: '#e2c96b', borda: '#b8a24e' },
  'dourado':  { corpo: '#cdb08a', borda: '#a68a66' },
  'titânio':  { corpo: '#8d8880', borda: '#635f59' },
  'titanio':  { corpo: '#8d8880', borda: '#635f59' },
  'titânio deserto': { corpo: '#ab9379', borda: '#7d6a55' },
  'titânio natural': { corpo: '#9a938a', borda: '#6d6760' },
  'titânio preto':   { corpo: '#37363a', borda: '#1d1c1f' },
  'laranja':     { corpo: '#c26a34', borda: '#8f4a21' },
  'azul escuro': { corpo: '#31445f', borda: '#1d2a3c' },
  'ultramarino': { corpo: '#4a5ba4', borda: '#2f3c73' },
  'lavanda':     { corpo: '#b5a9d4', borda: '#8d82ab' },
  'teal':        { corpo: '#7cadab', borda: '#527d7c' },
  'sálvia':      { corpo: '#97a48f', borda: '#6d7867' },
  'névoa':       { corpo: '#a9bdca', borda: '#7d909c' }
};

function paleta(cor) {
  return CORES[String(cor || '').toLowerCase().trim()] || { corpo: '#3d434b', borda: '#23272c' };
}

/* ---------------- Desenho do aparelho (SVG) ------------------------------ */
function aparelhoSVG(cor, id) {
  const c = paleta(cor);
  const g = 'g' + String(id).replace(/[^a-z0-9]/gi, '');
  return (
    '<svg class="dev" viewBox="0 0 180 320" role="img" aria-label="Ilustração de iPhone">' +
      '<defs>' +
        '<linearGradient id="' + g + 'b" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="' + c.corpo + '"/>' +
          '<stop offset="1" stop-color="' + c.borda + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + g + 's" x1="0.1" y1="0" x2="0.9" y2="1">' +
          '<stop offset="0" stop-color="#1d2732"/>' +
          '<stop offset="0.55" stop-color="#0d1420"/>' +
          '<stop offset="1" stop-color="#16202c"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + g + 'g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>' +
          '<stop offset="0.45" stop-color="#ffffff" stop-opacity="0.02"/>' +
          '<stop offset="1" stop-color="#ffffff" stop-opacity="0.10"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect x="14" y="52" width="6" height="26" rx="3" fill="' + c.borda + '"/>' +
      '<rect x="14" y="92" width="6" height="40" rx="3" fill="' + c.borda + '"/>' +
      '<rect x="160" y="96" width="6" height="56" rx="3" fill="' + c.borda + '"/>' +
      '<rect x="18" y="8" width="144" height="304" rx="30" fill="url(#' + g + 'b)"/>' +
      '<rect x="24" y="14" width="132" height="292" rx="25" fill="url(#' + g + 's)"/>' +
      '<rect x="72" y="22" width="36" height="10" rx="5" fill="#05080c"/>' +
      '<rect x="24" y="14" width="132" height="292" rx="25" fill="url(#' + g + 'g)"/>' +
      '<rect x="66" y="292" width="48" height="4" rx="2" fill="#ffffff" opacity="0.5"/>' +
    '</svg>'
  );
}

/* ---------------- Utilidades -------------------------------------------- */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

/* Os preços não são exibidos no site (ver CONFIG.mostrarPrecos em products.js):
   o valor é passado pela equipe no WhatsApp. */
function preco(p) {
  if (CONFIG.mostrarPrecos && typeof p.preco === 'number') return brl.format(p.preco);
  return 'Valor pelo WhatsApp';
}

function normalizar(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function esc(t) {
  return String(t).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

/* ---------------- WhatsApp ---------------------------------------------- */
const WA_CONFIGURADO = /^\d{12,13}$/.test(CONFIG.whatsapp) && !/0{6,}/.test(CONFIG.whatsapp);

function linkWhatsApp(mensagem) {
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(mensagem);
}

function abrirWhatsApp(mensagem) {
  if (!WA_CONFIGURADO) {
    aviso('Número do WhatsApp ainda não configurado. Preencha CONFIG.whatsapp em js/products.js.');
    return;
  }
  window.open(linkWhatsApp(mensagem), '_blank', 'noopener');
}

function mensagemProduto(p) {
  if (p.status === 'reservado') {
    return 'Olá! O ' + p.modelo + ' ' + p.armazenamento + 'GB' + (p.cor ? ' ' + p.cor : '') +
           ' está reservado no site. Gostaria de saber se ele pode ficar disponível.';
  }
  return 'Olá! Tenho interesse no ' + p.modelo + ' ' + p.armazenamento + 'GB' +
         (p.cor ? ' ' + p.cor : '') + (p.condicao ? ' (' + p.condicao.toLowerCase() + ')' : '') +
         '. Gostaria de saber se ele ainda está disponível.';
}

/* ---------------- Aviso (toast) ----------------------------------------- */
let toastTimer;
function aviso(texto) {
  const el = document.getElementById('toast');
  el.textContent = texto;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('on'); }, 4800);
}

/* ---------------- Cards -------------------------------------------------- */
function card(p) {
  const st = STATUS[p.status] || STATUS.disponivel;
  const vendido = p.status === 'vendido';
  const media = p.imagem
    ? '<img src="' + esc(p.imagem) + '" alt="' + esc(p.modelo) + '" loading="lazy">'
    : aparelhoSVG(p.cor, p.id);

  const acao = vendido
    ? '<button class="btn btn-ghost btn-full" type="button" disabled>Aparelho vendido</button>'
    : '<button class="btn btn-wa btn-full" type="button" data-produto="' + esc(p.id) + '">' +
        '<span class="ico-wa" aria-hidden="true"></span>Tenho interesse</button>';

  return (
    '<article class="card' + (vendido ? ' card-out' : '') + '">' +
      '<div class="card-media">' +
        '<span class="badge ' + st.classe + '">' + st.rotulo + '</span>' +
        (vendido ? '' :
          '<label class="card-cmp"><input type="checkbox" data-cmp="' + esc(p.id) + '"' +
          (comparar.indexOf(String(p.id)) !== -1 ? ' checked' : '') + '>Comparar</label>') +
        media +
      '</div>' +
      '<div class="card-body">' +
        '<h3>' + esc(p.modelo) + '</h3>' +
        '<p class="card-specs">' +
          '<span>' + esc(p.armazenamento) + ' GB</span>' +
          '<span>' + (p.cor ? esc(p.cor) : 'Cores variadas') + '</span>' +
          (p.condicao ? '<span>' + esc(p.condicao) + '</span>' : '') +
        '</p>' +
        '<p class="card-price' + (CONFIG.mostrarPrecos ? '' : ' card-ask') + '">' + preco(p) + '</p>' +
        acao +
      '</div>' +
    '</article>'
  );
}

/* ---------------- Filtros ------------------------------------------------ */
function opcoes(select, valores, ordenar) {
  const lista = ordenar ? valores.slice().sort(ordenar) : valores.slice().sort();
  lista.forEach(function (v) {
    const o = document.createElement('option');
    o.value = String(v);
    o.textContent = typeof v === 'number' ? v + ' GB' : v;
    select.appendChild(o);
  });
}

function montarFiltros() {
  const unico = function (chave) {
    return estoque.reduce(function (acc, p) {
      if (p[chave] !== undefined && p[chave] !== '' && acc.indexOf(p[chave]) === -1) acc.push(p[chave]);
      return acc;
    }, []);
  };

  opcoes(document.getElementById('fModelo'), unico('modelo'));
  opcoes(document.getElementById('fCapacidade'), unico('armazenamento'), function (a, b) { return a - b; });
}

function filtrar() {
  const termo = normalizar(document.getElementById('fBusca').value);
  const modelo = document.getElementById('fModelo').value;
  const cap = document.getElementById('fCapacidade').value;
  const status = document.getElementById('fStatus').value;

  return estoque.filter(function (p) {
    if (modelo && p.modelo !== modelo) return false;
    if (cap && String(p.armazenamento) !== cap) return false;
    if (status && p.status !== status) return false;
    if (termo) {
      const alvo = normalizar([p.modelo, p.armazenamento + 'gb', p.cor, p.condicao].join(' '));
      if (alvo.indexOf(termo) === -1) return false;
    }
    return true;
  });
}

function ordenar(lista) {
  const peso = { disponivel: 0, reservado: 1, vendido: 2 };
  const pos = {};
  estoque.forEach(function (p, i) { pos[p.id] = i; });
  return lista.slice().sort(function (a, b) {
    return (peso[a.status] - peso[b.status]) || (pos[a.id] - pos[b.id]);
  });
}

function renderizar() {
  const itens = ordenar(filtrar());
  const grade = document.getElementById('grade');
  const vazio = document.getElementById('vazio');

  grade.innerHTML = itens.map(card).join('');
  vazio.hidden = itens.length > 0;

  const disp = itens.filter(function (p) { return p.status === 'disponivel'; }).length;
  document.getElementById('contador').textContent =
    itens.length === 0
      ? 'Nenhum aparelho encontrado'
      : itens.length + (itens.length === 1 ? ' aparelho' : ' aparelhos') +
        (disp !== itens.length ? ', ' + disp + (disp === 1 ? ' disponível' : ' disponíveis') : '');
}

/* ---------------- Comparador de modelos --------------------------------- */
function atualizarBarraComparar() {
  const n = comparar.length;
  document.getElementById('cmpBar').hidden = n === 0;
  document.getElementById('cmpTxt').textContent =
    n + (n === 1 ? ' selecionado' : ' selecionados');
  const abrir = document.getElementById('cmpOpen');
  abrir.disabled = n < 2;
  abrir.title = n < 2 ? 'Selecione pelo menos 2 aparelhos' : '';
}

function abrirComparador() {
  const itens = comparar.map(function (id) {
    return estoque.filter(function (p) { return String(p.id) === id; })[0];
  }).filter(Boolean);
  if (itens.length < 2) { aviso('Selecione pelo menos 2 aparelhos para comparar.'); return; }

  const ficha = function (p) { return (typeof MODELOS !== 'undefined' && MODELOS[p.modelo]) || {}; };
  const linhas = [
    ['Capacidade', function (p) { return p.armazenamento + ' GB'; }],
    ['Condição',   function (p) { return p.condicao || '—'; }],
    ['Cor',        function (p) { return p.cor || 'Cores variadas'; }],
    ['Chip',       function (p) { return ficha(p).chip || '—'; }],
    ['Tela',       function (p) { return ficha(p).tela || '—'; }],
    ['Câmeras',    function (p) { return ficha(p).camera || '—'; }],
    ['Conector',   function (p) { return ficha(p).conector || '—'; }],
    ['Situação',   function (p) { return (STATUS[p.status] || STATUS.disponivel).rotulo; }]
  ];

  const cel = function (tag, fn) {
    return itens.map(function (p) { return '<' + tag + '>' + fn(p) + '</' + tag + '>'; }).join('');
  };

  document.getElementById('cmpBody').innerHTML =
    '<table>' +
      '<thead><tr><th scope="col"></th>' + cel('th', function (p) { return esc(p.modelo); }) + '</tr></thead>' +
      '<tbody>' +
        linhas.map(function (l) {
          return '<tr><th scope="row">' + l[0] + '</th>' + cel('td', function (p) { return esc(l[1](p)); }) + '</tr>';
        }).join('') +
      '</tbody>' +
      '<tfoot><tr><td></td>' + cel('td', function (p) {
        return '<button class="btn btn-wa btn-sm" type="button" data-produto="' + esc(p.id) + '">' +
               '<span class="ico-wa" aria-hidden="true"></span>Tenho interesse</button>';
      }) + '</tr></tfoot>' +
    '</table>';

  const dlg = document.getElementById('cmp');
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}

/* ---------------- Depoimentos ------------------------------------------- */
function montarDepoimentos() {
  const lista = (typeof DEPOIMENTOS !== 'undefined' && DEPOIMENTOS) || [];
  const sec = document.getElementById('depoimentos');
  if (!sec || lista.length === 0) return;   /* sem depoimentos reais, a seção fica oculta */

  document.getElementById('depGrid').innerHTML = lista.map(function (d) {
    const nota = Math.max(0, Math.min(5, Math.round(d.nota || 5)));
    return (
      '<figure>' +
        '<div class="dep-stars" role="img" aria-label="Nota ' + nota + ' de 5">' +
          '★★★★★'.slice(0, nota) + '<span style="opacity:.25">' + '★★★★★'.slice(nota) + '</span></div>' +
        '<blockquote>“' + esc(d.texto) + '”</blockquote>' +
        '<figcaption><strong>' + esc(d.nome) + '</strong>' + (d.cidade ? ' · ' + esc(d.cidade) : '') + '</figcaption>' +
      '</figure>'
    );
  }).join('');

  const g = document.getElementById('depGoogle');
  if (CONFIG.avaliacoesGoogle) { g.href = CONFIG.avaliacoesGoogle; g.hidden = false; }
  sec.hidden = false;
}

/* ---------------- Ligações da interface --------------------------------- */
function ligarEventos() {
  /* Filtros */
  const form = document.getElementById('filters');
  form.addEventListener('input', renderizar);
  form.addEventListener('change', renderizar);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  document.getElementById('limpar').addEventListener('click', function () {
    form.reset();
    document.getElementById('fStatus').value = 'disponivel';
    renderizar();
  });

  /* "Tenho interesse" — delegação de eventos na grade */
  document.getElementById('grade').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-produto]');
    if (!btn) return;
    const p = estoque.filter(function (x) { return String(x.id) === btn.dataset.produto; })[0];
    if (p) abrirWhatsApp(mensagemProduto(p));
  });

  /* Comparador */
  document.getElementById('grade').addEventListener('change', function (e) {
    const box = e.target.closest('[data-cmp]');
    if (!box) return;
    const id = box.dataset.cmp;
    if (box.checked) {
      if (comparar.length >= MAX_COMPARAR) {
        box.checked = false;
        aviso('Você pode comparar até ' + MAX_COMPARAR + ' aparelhos por vez.');
        return;
      }
      comparar.push(id);
    } else {
      comparar = comparar.filter(function (x) { return x !== id; });
    }
    atualizarBarraComparar();
  });
  document.getElementById('cmpOpen').addEventListener('click', abrirComparador);
  document.getElementById('cmpClear').addEventListener('click', function () {
    comparar = [];
    atualizarBarraComparar();
    renderizar();
  });
  const dlg = document.getElementById('cmp');
  document.getElementById('cmpClose').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) { dlg.close(); return; }
    const btn = e.target.closest('[data-produto]');
    if (!btn) return;
    const p = estoque.filter(function (x) { return String(x.id) === btn.dataset.produto; })[0];
    if (p) abrirWhatsApp(mensagemProduto(p));
  });

  /* Links de WhatsApp espalhados pelo site */
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    if (WA_CONFIGURADO) {
      el.href = linkWhatsApp(el.dataset.wa);
      el.target = '_blank';
      el.rel = 'noopener';
    } else {
      el.href = '#';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        abrirWhatsApp(el.dataset.wa);
      });
    }
  });

  /* Instagram */
  document.querySelectorAll('[data-instagram]').forEach(function (el) {
    if (CONFIG.instagram) {
      el.href = 'https://instagram.com/' + CONFIG.instagram.replace('@', '');
      el.target = '_blank';
      el.rel = 'noopener';
    } else {
      el.href = '#';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        aviso('Perfil do Instagram ainda não configurado. Preencha CONFIG.instagram em js/products.js.');
      });
    }
  });

  /* Google Maps */
  document.querySelectorAll('[data-maps]').forEach(function (el) {
    el.href = CONFIG.googleMaps ||
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CONFIG.endereco);
    el.target = '_blank';
    el.rel = 'noopener';
  });

  /* Mapa incorporado (usa o endereço, sem chave de API) */
  const mapa = document.getElementById('mapa');
  if (mapa) {
    mapa.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(CONFIG.endereco) +
      '&z=16&output=embed';
  }

  /* Menu hamburger */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    const aberto = nav.classList.toggle('on');
    burger.classList.toggle('on', aberto);
    burger.setAttribute('aria-expanded', String(aberto));
    burger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('on');
      burger.classList.remove('on');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* Sombra do header ao rolar */
  const header = document.getElementById('header');
  const onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 12); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------------- Composição do hero ------------------------------------ */
function montarHero() {
  const alvo = document.getElementById('heroArt');
  if (!alvo) return;
  /* três acabamentos diferentes, só para a composição não repetir aparelhos */
  const cores = [];
  estoque.forEach(function (p) {
    if (p.status !== 'vendido' && p.cor && cores.indexOf(p.cor) === -1) cores.push(p.cor);
  });
  ['Titânio deserto', 'Azul escuro', 'Preto'].forEach(function (c) {
    if (cores.length < 3 && cores.indexOf(c) === -1) cores.push(c);
  });

  alvo.innerHTML = cores.slice(0, 3).map(function (cor, i) {
    return '<div class="hero-dev hero-dev-' + (i + 1) + '">' + aparelhoSVG(cor, 'hero' + i) + '</div>';
  }).join('');
}

/* ---------------- Detalhes do rodapé/marca ------------------------------ */
function aplicarMarca() {
  document.querySelectorAll('[data-brand-name]').forEach(function (el) { el.textContent = CONFIG.nomeLoja; });
  document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll('.brand-logo').forEach(function (el) { el.alt = CONFIG.nomeLoja; });
  document.title = CONFIG.nomeLoja + ' — Catálogo de iPhones em Arapiraca-AL';
}

/* ---------------- Versão publicada (gerada por build-info.js no deploy) -- */
function mostrarVersao() {
  const el = document.getElementById('versao');
  const b = window.BUILD;
  if (!el || !b || !b.data) return;   /* em desenvolvimento local não há dados */
  const quando = new Date(b.data).toLocaleString('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Maceio'
  });
  el.textContent = 'Versão ' + b.sha + ' · publicada em ' + quando;
  el.hidden = false;
}

/* ---------------- Revelação suave (uma vez, respeitando preferências) --- */
function revelar() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const alvos = document.querySelectorAll('.sec-head, .split, .loc, .loc-map, .ig, .cta-in, .faq, .dep, .svc, .pull');
  const io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  alvos.forEach(function (el) { el.classList.add('rev'); io.observe(el); });
}

/* ---------------- Início ------------------------------------------------ */
(function iniciar() {
  estoque = carregarProdutos();
  aplicarMarca();
  montarFiltros();
  montarHero();
  ligarEventos();
  renderizar();
  montarDepoimentos();
  mostrarVersao();
  atualizarBarraComparar();
  revelar();

  /* App instalável (PWA): funciona em https ou localhost */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
