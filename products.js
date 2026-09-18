/* ==========================================================================
   products.js — CONFIGURAÇÃO DA LOJA + DADOS DO ESTOQUE
   --------------------------------------------------------------------------
   Este é o ÚNICO arquivo que precisa ser editado no dia a dia.
   Nenhum backend, nenhum banco de dados: tudo estático em JavaScript.
   ========================================================================== */


/* --------------------------------------------------------------------------
   1) CONFIGURAÇÃO — preencha com os dados reais da loja
   -------------------------------------------------------------------------- */
const CONFIG = {

  // Nome exibido no header, no footer e no título da página.
  nomeLoja: 'Cell Shop',

  // WhatsApp em formato internacional, só números: 55 + DDD + número.
  // Exemplo (Arapiraca): '5582999999999'
  whatsapp: '5582993824314',

  // Perfil oficial do Instagram (só o usuário, sem @ e sem link).
  // Exemplo: 'cellshop'
  instagram: 'cellshop.alagoas',

  // Link do Google Maps da loja (copie de "Compartilhar" no Google Maps).
  // Se ficar vazio, o botão faz uma busca pelo endereço abaixo.
  googleMaps: '',

  // Endereço usado como alternativa na busca do Maps.
  endereco: 'Rua Expedicionários Brasileiro, 600 B, Empresarial Adelina Rocha, Sala 4, Arapiraca - AL, 57307-295',

  // Preços NÃO aparecem no site: o cliente toca em "Tenho interesse" e o
  // valor é passado pela equipe no WhatsApp.
  // Para voltar a exibir preços um dia, mude para true e preencha o campo
  // "preco" dos produtos abaixo.
  mostrarPrecos: false,

  // Link da página da loja no Google (avaliações). Opcional: se preenchido,
  // aparece o botão "Ver avaliações no Google" na seção de depoimentos.
  avaliacoesGoogle: ''
};


/* --------------------------------------------------------------------------
   DEPOIMENTOS — adicione somente depoimentos REAIS de clientes (com
   autorização). Enquanto a lista estiver vazia, a seção não aparece no site.
   Exemplo:
     { nome: 'Maria S.', cidade: 'Arapiraca', texto: 'Atendimento excelente!', nota: 5 }
   -------------------------------------------------------------------------- */
const DEPOIMENTOS = [];


/* --------------------------------------------------------------------------
   FICHA TÉCNICA para o comparador de modelos (chave = nome exato do modelo).
   Confira/ajuste os dados conforme os aparelhos que você vende.
   -------------------------------------------------------------------------- */
const MODELOS = {
  'iPhone 17 Pro Max': { chip: 'A19 Pro',    tela: '6,9"', camera: '48 MP + 48 MP ultra + 48 MP tele (4x)', conector: 'USB-C' },
  'iPhone 17 Pro':     { chip: 'A19 Pro',    tela: '6,3"', camera: '48 MP + 48 MP ultra + 48 MP tele (4x)', conector: 'USB-C' },
  'iPhone 17':         { chip: 'A19',        tela: '6,3"', camera: '48 MP + 48 MP ultra',                    conector: 'USB-C' },
  'iPhone 16 Pro Max': { chip: 'A18 Pro',    tela: '6,9"', camera: '48 MP + 48 MP ultra + 12 MP tele (5x)', conector: 'USB-C' },
  'iPhone 16 Pro':     { chip: 'A18 Pro',    tela: '6,3"', camera: '48 MP + 48 MP ultra + 12 MP tele (5x)', conector: 'USB-C' },
  'iPhone 16':         { chip: 'A18',        tela: '6,1"', camera: '48 MP + 12 MP ultra',                    conector: 'USB-C' },
  'iPhone 15 Pro Max': { chip: 'A17 Pro',    tela: '6,7"', camera: '48 MP + 12 MP ultra + 12 MP tele (5x)', conector: 'USB-C' },
  'iPhone 15 Pro':     { chip: 'A17 Pro',    tela: '6,1"', camera: '48 MP + 12 MP ultra + 12 MP tele (3x)', conector: 'USB-C' },
  'iPhone 15':         { chip: 'A16 Bionic', tela: '6,1"', camera: '48 MP + 12 MP ultra',                    conector: 'USB-C' },
  'iPhone 14 Pro Max': { chip: 'A16 Bionic', tela: '6,7"', camera: '48 MP + 12 MP ultra + 12 MP tele (3x)', conector: 'Lightning' },
  'iPhone 14 Pro':     { chip: 'A16 Bionic', tela: '6,1"', camera: '48 MP + 12 MP ultra + 12 MP tele (3x)', conector: 'Lightning' },
  'iPhone 14':         { chip: 'A15 Bionic', tela: '6,1"', camera: '12 MP + 12 MP ultra',                    conector: 'Lightning' },
  'iPhone 13 Pro':     { chip: 'A15 Bionic', tela: '6,1"', camera: '12 MP + 12 MP ultra + 12 MP tele (3x)', conector: 'Lightning' },
  'iPhone 13':         { chip: 'A15 Bionic', tela: '6,1"', camera: '12 MP + 12 MP ultra',                    conector: 'Lightning' },
  'iPhone 12 Pro':     { chip: 'A14 Bionic', tela: '6,1"', camera: '12 MP + 12 MP ultra + 12 MP tele (2x)', conector: 'Lightning' },
  'iPhone 12':         { chip: 'A14 Bionic', tela: '6,1"', camera: '12 MP + 12 MP ultra',                    conector: 'Lightning' }
};


/* --------------------------------------------------------------------------
   2) ESTOQUE
   --------------------------------------------------------------------------
   ATENÇÃO: os itens abaixo são DADOS DE DEMONSTRAÇÃO, criados apenas para
   mostrar como o catálogo se comporta. Substitua pelos aparelhos reais.

   Campos de cada produto:
     id            — identificador único (texto ou número)
     modelo        — ex.: 'iPhone 17 Pro'
     armazenamento — em GB (número), ex.: 256
     condicao      — opcional: 'Novo', 'Seminovo', 'Vitrine'...
     cor           — OPCIONAL. Os cards mostram "Cores variadas" quando o campo
                     não existe. Se você preencher (ex.: cor: 'Titânio'), a cor
                     aparece no card e a ilustração é desenhada nesse tom.
     imagem        — opcional: caminho da foto, ex.: 'assets/images/iphone-17.jpg'
                     Se ficar vazio, o site desenha o aparelho na cor informada.
     status        — 'disponivel' | 'reservado' | 'vendido'
     preco         — opcional e desativado por padrão (ver CONFIG.mostrarPrecos)

   Esta estrutura é a mesma que uma API REST devolveria no futuro:
   basta trocar o array por um fetch('/api/produtos') que o restante do
   site continua funcionando (ver comentário em js/script.js).
   -------------------------------------------------------------------------- */
const PRODUTOS = [

  /* ---- Linha 17 ---- */
  { id: 'demo-17-promax', modelo: 'iPhone 17 Pro Max', armazenamento: 512, condicao: 'Novo', imagem: '', status: 'disponivel' },
  { id: 'demo-17-pro',    modelo: 'iPhone 17 Pro',     armazenamento: 256, condicao: 'Novo', imagem: '', status: 'disponivel' },
  { id: 'demo-17',        modelo: 'iPhone 17',         armazenamento: 256, condicao: 'Novo', imagem: '', status: 'disponivel' },

  /* ---- Linha 16 ---- */
  { id: 'demo-16-promax', modelo: 'iPhone 16 Pro Max', armazenamento: 256, condicao: 'Novo', imagem: '', status: 'disponivel' },
  { id: 'demo-16-pro',    modelo: 'iPhone 16 Pro',     armazenamento: 256, condicao: 'Novo', imagem: '', status: 'disponivel' },
  { id: 'demo-16',        modelo: 'iPhone 16',         armazenamento: 128, condicao: 'Novo', imagem: '', status: 'disponivel' },

  /* ---- Linha 15 ---- */
  { id: 'demo-15-promax', modelo: 'iPhone 15 Pro Max', armazenamento: 256, condicao: 'Novo',     imagem: '', status: 'disponivel' },
  { id: 'demo-15-pro',    modelo: 'iPhone 15 Pro',     armazenamento: 256, condicao: 'Novo',     imagem: '', status: 'disponivel' },
  { id: 'demo-15',        modelo: 'iPhone 15',         armazenamento: 128, condicao: 'Novo',     imagem: '', status: 'disponivel' },

  /* ---- Linha 14 ---- */
  { id: 'demo-14-promax', modelo: 'iPhone 14 Pro Max', armazenamento: 256, condicao: 'Seminovo', imagem: '', status: 'disponivel' },
  { id: 'demo-14-pro',    modelo: 'iPhone 14 Pro',     armazenamento: 128, condicao: 'Seminovo', imagem: '', status: 'reservado' },
  { id: 'demo-14',        modelo: 'iPhone 14',         armazenamento: 128, condicao: 'Seminovo', imagem: '', status: 'disponivel' },

  /* ---- Linha 13 ---- */
  { id: 'demo-13-pro',    modelo: 'iPhone 13 Pro',     armazenamento: 128, condicao: 'Seminovo', imagem: '', status: 'disponivel' },
  { id: 'demo-13',        modelo: 'iPhone 13',         armazenamento: 128, condicao: 'Seminovo', imagem: '', status: 'disponivel' },

  /* ---- Linha 12 ---- */
  { id: 'demo-12-pro',    modelo: 'iPhone 12 Pro',     armazenamento: 128, condicao: 'Seminovo', imagem: '', status: 'vendido' },
  { id: 'demo-12',        modelo: 'iPhone 12',         armazenamento: 64,  condicao: 'Seminovo', imagem: '', status: 'disponivel' }
];
