# DYOLIVEIRAYT

Site do canal [DYOLIVEIRAYT](https://www.youtube.com/@dyoliveirayt): velocross, camping e aventuras ao ar livre.

No ar em **https://dioneioliveira.github.io**

Todo o conteúdo do site (vídeos, fotos, campings, próxima corrida) fica em `js/config.js`.
Qualquer mudança enviada para a branch `main` vai ao ar em 1 a 2 minutos.

## Atualização automática semanal

Toda **segunda-feira às 9h** (horário de Brasília), o GitHub roda `scripts/atualizar.py`, que:

- busca os vídeos mais recentes do canal (sem os Shorts);
- atualiza o número de inscritos e o total de vídeos;
- grava tudo em `js/auto.js` e publica o site.

Não precisa de chave de API. Vídeo novo que não está no `config.js` entra com o título do YouTube
e uma categoria escolhida pelo título; para ajustar título ou categoria, cadastre o vídeo no `config.js`.

Para rodar na hora: aba **Actions** → **Atualização semanal do site** → **Run workflow**.
