# Calendar Engine

> Um editor visual de calendários focado em produtividade e edição em massa.

## Filosofia

Este projeto NÃO é um concorrente direto do Google Calendar.

O objetivo é construir um editor de calendários onde editar dezenas ou centenas de eventos seja rápido e intuitivo.

O conceito principal é tratar um calendário como uma planilha (Excel) aplicada ao tempo.

A prioridade não é criar eventos individuais, mas realizar operações em lote.

---

# Objetivos

- Offline First
- Open Source
- PWA
- Rápido
- Simples
- Extensível
- API First
- Engine First

---

# Não objetivos da V1

- Google Calendar
- Outlook
- iCloud
- Sincronização online
- Multiusuário
- CLI
- MCP
- Plugins

Esses recursos serão adicionados somente após estabilização do Engine.

---

# Arquitetura

```
Vue UI
    │
    ▼
Calendar Engine
    │
Storage
```

A UI nunca manipula dados diretamente.

Toda alteração passa pelo Engine.

---

# Stack

Frontend

- Vue 3
- TypeScript
- Vite
- Pinia (somente UI)
- Tailwind
- shadcn-vue

Persistência

- IndexedDB (Dexie)

Testes

- Vitest

Documentação

- VitePress

---

# Estrutura

```
calendar/

apps/

    web/

packages/

    engine/

    domain/

    storage/

    shared/
```

---

# Domínio

Workspace

```
Workspace
    Calendars[]
```

Calendar

```
Calendar

id

name

color

visible

presets[]

cells[]
```

Preset

```
Preset

id

name

emoji

color

category
```

Cell

```
Cell

date

presetId
```

Nesta versão não existe Event complexo.

Cada dia referencia apenas um Preset.

---

# Princípios

1.

O Engine não conhece Vue.

2.

O Engine não conhece IndexedDB.

3.

O Engine nunca conhece HTML.

4.

Toda alteração passa pelo Engine.

5.

Tudo deve funcionar em lote.

6.

Undo/Redo desde o primeiro dia.

---

# MVP

## Workspace

- criar calendário
- renomear calendário
- excluir calendário
- duplicar calendário

---

## Presets

- criar
- editar
- excluir

Campos

- nome
- emoji
- cor

---

## Calendário

Visualização mensal.

---

## Seleção

Suportar

- clique
- Ctrl+Clique
- Shift
- Arrastar

---

## Operações

Aplicar preset

Remover preset

Copiar

Colar

Mover

Duplicar

Delete

Undo

Redo

---

## Persistência

Salvar automaticamente.

IndexedDB.

---

## Busca

Buscar presets.

Buscar calendário.

---

## Atalhos

Ctrl+C

Ctrl+V

Delete

Ctrl+Z

Ctrl+Y

Ctrl+F

---

# Filosofia de edição

Nunca editar um evento isolado quando puder editar vários.

Todas as operações devem aceitar múltiplas células.

Exemplos

- aplicar preset
- remover
- mover
- substituir
- copiar
- colar

---

# Fluxo

```
Selecionar

↓

Executar ação

↓

Engine

↓

Persistência

↓

Atualizar UI
```

---

# Regras

A UI nunca altera o estado diretamente.

A UI apenas chama o Engine.

Exemplo

```
engine.applyPreset()

engine.removePreset()

engine.copy()

engine.paste()

engine.undo()

engine.redo()
```

---

# Roadmap

## V1

Editor Offline

## V2

CLI

## V3

MCP

## V4

Google Calendar

## V5

Plugins

---

# O que torna este projeto diferente

Este projeto não tenta ser uma agenda melhor.

Ele tenta ser o editor de calendários mais rápido possível.

A inspiração não é Google Calendar.

A inspiração é Excel, Figma, Photoshop e VSCode.

Selecionar.

Editar.

Copiar.

Colar.

Mover.

Substituir.

Tudo em massa.

---

# Regra de Ouro

Sempre perguntar:

"Essa funcionalidade melhora a edição em lote?"

Se a resposta for NÃO,
provavelmente ela não pertence ao projeto.

Se a resposta for SIM,
ela merece entrar no Engine.
