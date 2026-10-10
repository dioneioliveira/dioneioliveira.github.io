/* =====================================================================
   CONFIGURAÇÃO DO SITE DYOLIVEIRAYT
   Todo o conteúdo do site vem daqui. Edite textos, links e listas
   abaixo; não precisa mexer no app.js.

   Vídeos: "id" é o código do YouTube (o trecho depois de "watch?v=").
   A miniatura e o player são montados automaticamente a partir dele.
   Fotos: coloque o arquivo em assets/fotos/ e aponte em "src".
   Dados coletados do canal em 06/10/2026.
   ===================================================================== */
window.SITE = {
  canal: {
    nome: "DYOLIVEIRAYT",
    handle: "@dyoliveirayt",
    url: "https://www.youtube.com/@dyoliveirayt",
    instagram: "https://instagram.com/dyoliveirayt",
    temas: ["Aventuras", "Velocross", "Camping"],
    descricao: "Uma vida movida por desafios: velocross, corridas de rua, camping, viagens e aventuras ao ar livre. Toda semana tem vídeo novo com os bastidores, a evolução e as histórias reais de quem acredita que a melhor parte da vida acontece fora de casa.",
    emailParcerias: "", // opcional: preencha para mostrar um e-mail no lugar do Instagram

    /* CONTADOR DE INSCRITOS
       Sem chave da API, o site mostra o último registro abaixo.
       Com chave (veja o README), mostra o número ao vivo. */
    channelId: "UCo5GGyce2Z4DC0usGcQ3qkA",
    apiKey: "",
    inscritos: 8650,
    inscritosData: "06/10/2026",
    videosPublicados: 832,
    atualizarACadaSegundos: 60,
    buscarVideosRecentes: true
  },

  redes: [
    { nome: "YouTube", url: "https://www.youtube.com/@dyoliveirayt" },
    { nome: "Instagram", url: "https://instagram.com/dyoliveirayt" }
  ],

  /* numero: placa de corrida (deixe "" para mostrar as iniciais) */
  /* foto: "assets/equipe/arquivo.jpg" (rosto em quadrado). Sem foto, aparece o número ou as iniciais. */
  equipe: [
    { nome: "Dionei Oliveira", papel: "Criador do canal, câmera e piloto", numero: "", foto: "assets/equipe/dionei.jpg" },
    { nome: "Heidi", papel: "Parceira de trilha e de camping", numero: "", foto: "assets/equipe/heidi.jpg" },
    { nome: "Vinicius", apelido: "Vini", papel: "Piloto de velocross", numero: "07", foto: "assets/equipe/vinicius.jpg" },
    { nome: "Gustavo", papel: "Piloto de velocross", numero: "12", foto: "assets/equipe/gustavo.jpg" }
  ],

  temporada: {
    titulo: "Rumo ao Pódio",
    subtitulo: "Temporada 2026",
    descricao: "A série acompanha a preparação para as corridas de velocross de 2026: treinos no CT, ajustes na moto, largadas e os dias de prova.",
    destaque: "QOQNJqPerm4",
    playlist: "PLiUWjZvr3mm-7w-Ct2Dlx6cjW058Ggu1M",
    /* Próxima corrida: preencha nome, local e data (formato 2026-11-15T09:00:00-03:00)
       para ligar a contagem regressiva. Sem data, aparece "data a confirmar". */
    proxima: { nome: "Próxima etapa", local: "", data: "" },
    parceiros: [
      { nome: "BL Motos Racing", url: "https://www.youtube.com/@Blmotosracing94" },
      { nome: "TRSF Racing", url: "" },
      { nome: "CT Greipel", url: "" }
    ],
    /* Vídeos da temporada, do mais antigo para o mais recente */
    diario: ["M3KMI-Bai-M", "Uc3p8jv_L3A", "R6h_hssdNek", "xTlM1BYaoPY", "OA6__N3MWa0", "qgXnTkbBZ0o", "chUw40WO0UE", "PEXYptIFkng", "RyWxLd-ojqE", "m0pPSKNPGBY", "V1_XdDOT1wc", "QOQNJqPerm4", "VktrnwkYI6Y", "D6YO52AXLQA"]
  },

  /* Do mais recente para o mais antigo.
     categoria: "Velocross", "Camping", "Aventura", "Trilha" ou "Vlog" */
  videos: [
    { id: "D6YO52AXLQA", titulo: "Deu ruim! Fiz o PIOR Cavalete de Moto pro Vini", categoria: "Velocross", data: "2026-08-22", views: 2130 },
    { id: "VktrnwkYI6Y", titulo: "Tentei Baixar de 1 Minuto e QUASE deu ruim!", categoria: "Velocross", data: "2026-08-11", views: 53 },
    { id: "QOQNJqPerm4", titulo: "Depois de uma Largada Ruim... Fomos Treinar no Gate! (Rumo ao Pódio T2026 · EP7)", categoria: "Velocross", data: "2026-08-07", views: 658 },
    { id: "V1_XdDOT1wc", titulo: "O ERRO na Largada que Me Custou o PÓDIO no Velocross!", categoria: "Velocross", data: "2026-07-30", views: 564 },
    { id: "m0pPSKNPGBY", titulo: "ACAMPEI NA PISTA! Treino secreto pra Copa Serra Litoral de Velocross", categoria: "Camping", data: "2026-07-28", views: 190 },
    { id: "B96sCa0WyXM", titulo: "Fiquei PENDURADO em cima de uma CACHOEIRA de 60 METROS!", categoria: "Aventura", data: "2026-07-23", views: 14 },
    { id: "RyWxLd-ojqE", titulo: "Primeiro treino com a moto nova de velocross!", categoria: "Velocross" },
    { id: "PEXYptIFkng", titulo: "Treino no CT: moto quebrada e pista encharcada!", categoria: "Velocross" },
    { id: "oL8837vyGbQ", titulo: "NÃO ACREDITAVA quando entregamos a SURPRESA", categoria: "Vlog" },
    { id: "chUw40WO0UE", titulo: "CORRI PELA PRIMEIRA VEZ EM UMA CORRIDA DE VELOCROSS!", categoria: "Velocross" },
    { id: "qgXnTkbBZ0o", titulo: "VAMOS TREINAR PARA MINHA PRIMEIRA CORRIDA!", categoria: "Velocross" },
    { id: "OA6__N3MWa0", titulo: "Minimanobras com a minimoto no CT Greipel", categoria: "Velocross" },
    { id: "iLG-78kYxSY", titulo: "DO FRACASSO À DESCIDA PERFEITA!", categoria: "Aventura" },
    { id: "8i6h2tbYI98", titulo: "QUASE DERRETENDO! Olha o que fizemos pra se refrescar", categoria: "Vlog" },
    { id: "avgEC2Ph798", titulo: "Motocross na cachoeira! Que lugar insano!", categoria: "Aventura" },
    { id: "KSWuga4FrG8", titulo: "QUALQUER UM CONSEGUE PASSAR… MENOS EU", categoria: "Trilha" },
    { id: "9wXfLwse-YQ", titulo: "O PIOR DIA DE PESCA VIROU A MELHOR TRILHA!", categoria: "Trilha" },
    { id: "gfPrpZT-598", titulo: "NÃO ACREDITO NESSE LUGAR! Camping + Cachoeira", categoria: "Camping" },
    { id: "946ViQhSoGU", titulo: "Trilha INSANA pelo rio no Camping Cachoeira Paulista · Doutor Pedrinho SC (Parte 2)", categoria: "Camping" },
    { id: "DbRBNKvVFsU", titulo: "Camping Cachoeira Paulista está diferente! Veja as mudanças (Parte 1)", categoria: "Camping" },
    { id: "jzGLFC8rMXQ", titulo: "QUASE FIQUEI PRESO COM A TR4 E A CARRETINHA!", categoria: "Trilha" },
    { id: "xTlM1BYaoPY", titulo: "BAIXEI MEU TEMPO… MAS NA ÚLTIMA VOLTA...", categoria: "Velocross" },
    { id: "Q8lZJXE_eio", titulo: "TRIKE DRIFT INSANO! Essa curva quase deu ruim", categoria: "Aventura" },
    { id: "R6h_hssdNek", titulo: "MUITA DISPUTA E ALTO NÍVEL! CT Greipel com traçado novo", categoria: "Velocross" },
    { id: "Uc3p8jv_L3A", titulo: "TENTEI QUEBRAR MEU TEMPO NO VELOCROSS… DEU CERTO? (EP01)", categoria: "Velocross" },
    { id: "DoO0RZr39Nc", titulo: "Testamos um colchão inflável novo no camping. Será que aprovamos?", categoria: "Camping" },
    { id: "M3KMI-Bai-M", titulo: "O MAIOR SALTO DE MOTOCROSS QUE JÁ FIZ! Motocross radical em Piên PR", categoria: "Velocross" },
    { id: "bkSOFqZ3OQM", titulo: "Trilha fácil até a segunda cachoeira · Fazenda Evaristo", categoria: "Trilha" },
    { id: "ffcygKWyPGs", titulo: "Fiz a trilha sozinho no último dia de camping · Fazenda Evaristo", categoria: "Camping" },
    { id: "h5oAkfEVEg0", titulo: "A cachoeira mais bonita da fazenda! (Camping + Trilha) · Parte 1", categoria: "Camping" }
  ],

  playlists: [
    { nome: "Motocross", id: "PLiUWjZvr3mm-7w-Ct2Dlx6cjW058Ggu1M" },
    { nome: "Aventuras", id: "PLiUWjZvr3mm9Ha9jrd6EHP8OP_99qhQXp" },
    { nome: "Cachoeiras", id: "PLiUWjZvr3mm-6ogi2G1Z7Y4W6GosMMjmj" },
    { nome: "TR4: trilhas e aventuras off-road", id: "PLiUWjZvr3mm8_0w7P5TVk5qh9aga6RPD-" },
    { nome: "Caçadores de Aventuras Kids", id: "PLiUWjZvr3mm9oglWy9dfpw_aFm0w2AqZU" },
    { nome: "Trike drift", id: "PLiUWjZvr3mm9FKiypsCf1az6KFkl7SHfp" },
    { nome: "Quadriciclo", id: "PLiUWjZvr3mm8H16-Z9xkVI3NReLrXlQCZ" },
    { nome: "Kart", id: "PLiUWjZvr3mm9cnQoSdDhNwA9BP9r6-GFZ" },
    { nome: "Sandboard", id: "PLiUWjZvr3mm9deXmHeQrII3gp1gCWsQTE" },
    { nome: "Skimboard", id: "PLiUWjZvr3mm-V68mL-fltTX-SvzAOwruD" },
    { nome: "Pescaria", id: "PLiUWjZvr3mm_0LmAcV1QZlQ0W7WstQU4V" },
    { nome: "Aventuras no sítio", id: "PLiUWjZvr3mm_7icuIqcgGEEtWE6gYwFXm" },
    { nome: "Mar", id: "PLiUWjZvr3mm_SStMTRaOAHNMu4730Q_EY" },
    { nome: "Turismo", id: "PLiUWjZvr3mm8TIAv9RdFKfkgTYgV3lHuI" },
    { nome: "Desafios", id: "PLiUWjZvr3mm8UK3lzXoQwGAvaek1_ZFYN" },
    { nome: "Trollagens", id: "PLiUWjZvr3mm8q73IJfiD9hPhQJRhx602D" },
    { nome: "Reviews e dicas", id: "PLiUWjZvr3mm-iq3Au_HzRJ2q4COGQNXyG" },
    { nome: "Vlog", id: "PLiUWjZvr3mm9XHR2GX0Dj2taa_edx3pyB" }
  ],

  /* ÁLBUM: fotos da família. Coloque o arquivo em assets/fotos/ e adicione uma linha.
     As fotos aparecem lado a lado, em cascata, no formato original (em pé ou deitada). */
  fotos: [
    { src: "assets/fotos/familia-na-cachoeira.jpg", legenda: "A família reunida na cachoeira" },
    { src: "assets/fotos/tiro-com-arco.jpg", legenda: "Tiro com arco no meio da mata" },
    { src: "assets/fotos/barraca-e-fogueira.jpg", legenda: "Barraca montada e fogueira acesa" },
    { src: "assets/fotos/vini-gustavo-trilha.jpg", legenda: "Vini e Gustavo no meio da trilha" },
    { src: "assets/fotos/rampa-do-bugio.jpg", legenda: "Rampa do Bugio, Campo Alegre (SC), a 1.100 m" },
    { src: "assets/fotos/lama-trilha.jpg", legenda: "Lama na trilha de pinheiros" },
    { src: "assets/fotos/trilha-atras-da-cachoeira.jpg", legenda: "Trilha por trás da cachoeira" },
    { src: "assets/fotos/corrida-15.jpg", legenda: "Dia de corrida de velocross" }
  ],

  campings: [
    {
      nome: "Camping Cachoeira Paulista",
      local: "Doutor Pedrinho, SC",
      tags: ["Cachoeira", "Trilha pelo rio", "Camping"],
      texto: "Voltamos ao camping e mostramos o que mudou. Na segunda parte encaramos uma trilha pelo leito do rio.",
      mapa: "Camping Cachoeira Paulista Doutor Pedrinho SC",
      videos: [{ id: "DbRBNKvVFsU", rotulo: "Parte 1" }, { id: "946ViQhSoGU", rotulo: "Parte 2" }]
    },
    {
      nome: "Fazenda Evaristo",
      local: "Camping com cachoeiras",
      tags: ["Cachoeiras", "Trilha fácil", "Camping"],
      texto: "Camping com mais de uma cachoeira e trilha tranquila até a segunda queda. No último dia ainda rolou trilha solo.",
      mapa: "Fazenda Evaristo camping",
      videos: [{ id: "h5oAkfEVEg0", rotulo: "Parte 1" }, { id: "bkSOFqZ3OQM", rotulo: "Trilha" }, { id: "ffcygKWyPGs", rotulo: "Último dia" }]
    },
    {
      nome: "Acampamento na pista",
      local: "Copa Serra Litoral de Velocross",
      tags: ["Velocross", "Barraca na pista", "Treino"],
      texto: "Barraca montada ao lado da pista para treinar antes da corrida. Camping e velocross no mesmo fim de semana.",
      mapa: "",
      videos: [{ id: "m0pPSKNPGBY", rotulo: "Assistir" }]
    }
  ],

  checklist: {
    "Dormir": ["Barraca", "Saco de dormir", "Colchão inflável e bomba", "Travesseiro", "Lona extra"],
    "Cozinha": ["Fogareiro e gás", "Panela e frigideira", "Canecas", "Isqueiro reserva", "Água"],
    "Pista e trilha": ["Capacete e óculos", "Bota e joelheira", "Ferramentas da moto", "Corda e cinta da carretinha", "Gasolina extra"],
    "Segurança": ["Kit de primeiros socorros", "Lanterna de cabeça", "Repelente", "Protetor solar", "Carregador portátil"]
  },

  /* link: link de loja ou afiliado (opcional) */
  garagem: [
    { nome: "TR4 e carretinha", categoria: "Off-road", video: "jzGLFC8rMXQ", texto: "Leva as motos e o camping inteiro. Já quase ficou presa numa trilha.", link: "" },
    { nome: "Moto nova de velocross", categoria: "Velocross", video: "RyWxLd-ojqE", texto: "O primeiro treino com a máquina nova, do jeito que aconteceu.", link: "" },
    { nome: "Minimoto", categoria: "Velocross", video: "OA6__N3MWa0", texto: "Para treinar manobra e equilíbrio no CT.", link: "" },
    { nome: "Cavalete de moto feito em casa", categoria: "Oficina", video: "D6YO52AXLQA", texto: "Construímos um cavalete para a moto do Vini. Não saiu como o planejado.", link: "" },
    { nome: "Colchão inflável", categoria: "Camping", video: "DoO0RZr39Nc", texto: "Testado numa noite de camping. O veredito está no vídeo.", link: "" },
    { nome: "Trike drift", categoria: "Aventura", video: "Q8lZJXE_eio", texto: "Três rodas, ladeira e muita curva de lado.", link: "" }
  ],

  /* LOJA DA FAMÍLIA: produtos que vocês indicam.
     A seção só aparece no site quando tiver pelo menos um produto.
     Para cada produto:
       nome:      nome curto do produto
       categoria: "Camping", "Moto", "Trilha", "Kids"... (vira filtro)
       imagem:    "assets/loja/arquivo.jpg" (foto do produto)
       porque:    uma frase dizendo por que vocês recomendam
       preco:     opcional, ex.: "a partir de R$ 89" (preço muda, por isso "a partir de")
       video:     opcional, código do vídeo do YouTube onde o produto aparece
       shopee / mercadolivre: o link de compra (pode ter um ou os dois) */
  loja: {
    afiliado: true, // todos os links são de afiliado: mostra o aviso embaixo da loja

    /* VITRINE DA SHOPEE (automática)
       Toda segunda a atualização semanal puxa os produtos desta vitrine, com link
       de afiliado, foto e preço. Produto novo na vitrine aparece sozinho no site;
       produto removido ou esgotado some sozinho. */
    vitrineShopee: "https://collshp.com/dyoliveirayt?view=storefront",

    /* Ajustes opcionais dos produtos da vitrine, pelo código do produto na Shopee.
       Sem ajuste, o site usa o título da Shopee e escolhe a categoria pelo nome.
       Campos: nome, categoria, porque, video, mercadolivre (link extra), ocultar: true */
    ajustes: {
      "22899169696": { nome: "Camisa de motocross MTC 13A", categoria: "Moto", porque: "Para motocross, velocross e trilha, com tamanhos adulto e infantil." },
      "40222242951": { nome: "Colchão inflável King com bomba embutida", categoria: "Camping", porque: "Tamanho King (206 x 187 x 44 cm) com bomba de bateria embutida e removível." },
      "11123675699": { nome: "Protetor de guidão", categoria: "Moto", porque: "Almofada de 198 mm para guidão de pit bike, motocross e quadriciclo." },
      "22893667749": { nome: "Impermeabilizante de tecidos Ultra Lub", categoria: "Camping", porque: "Kit de 325 ml para impermeabilizar tecidos." },
      "22798668045": { nome: "Mesa dobrável de camping 120 x 60 cm", categoria: "Camping", porque: "Ajustável e portátil, para camping, praia e churrasco." },
      "43668802381": { nome: "Kit 2 lampiões LED com USB", categoria: "Camping", porque: "Iluminação para acampamento e pescaria." },
      "58256286551": { nome: "Colchão inflável MODOFO com bomba elétrica", categoria: "Camping", porque: "Bomba elétrica recarregável. Tem versão solteiro, casal, queen e king." },
      "23793406757": { nome: "Conjunto camiseta + short tactel", categoria: "Roupas", porque: "Conjunto masculino estilo country." },
      "25793214593": { nome: "Barraca automática 3 a 4 pessoas", categoria: "Camping", porque: "Montagem automática, 215 x 215 x 145 cm." },
      "40415433093": { nome: "Barraca automática 2 a 3 pessoas", categoria: "Camping", porque: "Montagem automática, para 2 a 3 pessoas." }
    },

    /* Produtos manuais (por exemplo, do Mercado Livre). Campos:
       nome, categoria, imagem ("assets/loja/arquivo.jpg" ou link da foto), porque,
       preco (texto livre), video, shopee, mercadolivre */
    produtos: []
  },

  blog: [
    {
      titulo: "Rumo ao Pódio 2026: a temporada até aqui",
      data: "2026-10-06",
      categoria: "Velocross",
      autor: "Equipe DYOLIVEIRAYT",
      leitura: "3 min",
      resumo: "Do primeiro treino com a moto nova até o treino de largada no gate.",
      texto: [
        "A série Rumo ao Pódio acompanha a nossa temporada 2026 de velocross: os treinos no CT Greipel, a moto nova, os tempos de volta e os dias de prova.",
        "Na Copa Serra Litoral a gente acampou na própria pista para treinar antes da corrida. Depois veio a prova em que um erro na largada custou o pódio.",
        "O episódio 7 foi a resposta: um treino inteiro no gate para acertar a largada. Os episódios estão no canal, na playlist de motocross."
      ]
    },
    {
      titulo: "Três lugares para acampar que já mostramos no canal",
      data: "2026-10-06",
      categoria: "Camping",
      autor: "Equipe DYOLIVEIRAYT",
      leitura: "3 min",
      resumo: "Cachoeira, trilha pelo rio e até barraca do lado da pista de velocross.",
      texto: [
        "Camping Cachoeira Paulista, em Doutor Pedrinho (SC): voltamos para ver as mudanças e encaramos uma trilha pelo rio na segunda parte.",
        "Fazenda Evaristo: camping com cachoeiras e uma trilha fácil até a segunda queda. Ótimo para ir com criança.",
        "Acampamento na pista: na Copa Serra Litoral, montamos a barraca ao lado da pista para treinar antes da corrida. Todos os vídeos estão na seção de campings do site."
      ]
    },
    {
      titulo: "Chegou agora? Comece por aqui",
      data: "2026-10-06",
      categoria: "Canal",
      autor: "Equipe DYOLIVEIRAYT",
      leitura: "2 min",
      resumo: "Um guia rápido pelas playlists do canal.",
      texto: [
        "Curte moto? Comece pela playlist de Motocross e pela série Rumo ao Pódio.",
        "Prefere natureza? Veja Cachoeiras, Aventuras e TR4: trilhas e aventuras off-road.",
        "Quer rir? Trollagens e Desafios. E para a criançada tem a playlist Caçadores de Aventuras Kids."
      ]
    }
  ]
};
