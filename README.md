# pling.net.br

> Aplicação destinada ao site da pling

* https://pling.net.br

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

### Passo 4: Instalar dependências globais do projeto
Para facilitar sua vida, você pode instalar os seguintes CLIs.

Gulp:
```
npm install gulp -g
```

Bower:
```
npm install bower -g
```

### Passo 5: Rodar projeto
Utilizando o Gulp você pode inicializar o projeto da seguinte forma

``` sh
gulp clean
gulp dev
```

### Tarefas automatizadas do Gulp

* __gulp test__    : roda o eslint para validar o código.
* __gulp clean__   : limpa a pasta dist.
* __gulp build__   : gera os arquivos dist.
* __gulp release__ : cria o arquivo tar.gz contendo todo o projeto dentro da pasta "release".
* __gulp dev__     : roda o projeto e levanta live-reload na porta configurada no gulpfile.js.


## Termos & Licença

Copyright 2016 Pling - Plataforma Integrada de Gestão LTDA
