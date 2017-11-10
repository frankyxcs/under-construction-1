# Pling Website

![image](https://user-images.githubusercontent.com/205932/29378840-eda733a8-8296-11e7-9cb4-4563a485d035.png)

### Configurando o ambiente de desenvolvimento

#### Passo 1: instalando ferramentas

* instalar git: [git-scm](http://git-scm.com/)
* instalar NodeJS (v5.10+): [nodejs.org](http://nodejs.org)

#### Passo 2: preparando repositório

Clone o repositório pling.net.br:
```
git clone https:/github.com/plingbr/pling.net.br
```

### Passo 3: Instalar dependências do projeto

```
cd blog
npm install
```

### Passo 4: Rodar projeto
Utilizando o Gulp você pode inicializar o projeto da seguinte forma

``` sh
# Modo Desenvolvimento
npm run dev
```

``` sh
# Modo PRD
npm start
```

### Tarefas automatizadas do Gulp

* __npm run test__    : roda o eslint para validar o código.
* __npm run clean__   : limpa a pasta dist.
* __npm run build__   : gera os arquivos dist.
* __npm run release__ : cria o arquivo tar.gz contendo todo o projeto dentro da pasta "release".
* __npm run dev__     : roda o projeto e levanta live-reload na porta configurada no gulpfile.js.


## Termos & Licença

Copyright 2016 Pling - Plataforma Integrada de Gestão LTDA
