# Cansche

Cansche é um editor de calendários offline-first orientado a produtividade e edição em lote. O projeto trata o calendário como uma grade de trabalho: operações que seriam repetitivas em eventos individuais devem ser rápidas, previsíveis e reversíveis.

A interface principal é uma aplicação Vue. A versão desktop é empacotada com Tauri e possui suporte a atualização assinada por releases do GitHub.

## Status

O projeto está em desenvolvimento ativo. O release desktop atualmente preparado no repositório é a versão 1.2.0.

O foco atual é consolidar o engine de calendário, a persistência local, a edição em massa e a experiência de atualização do aplicativo. Integrações com serviços externos e colaboração em tempo real não fazem parte do escopo atual.

## Principais recursos

- Workspaces com um ou mais calendários.
- Grade mensal para visualização e edição de eventos.
- Modelos reutilizáveis para criação rápida de eventos.
- Camadas para organizar, filtrar, colorir e controlar a visibilidade de eventos.
- Seleção de múltiplos itens e operações em lote.
- Histórico de comandos com suporte a desfazer e refazer.
- Importação e exportação de calendários e workspaces em arquivos JSON no formato Cansche.
- Configurações persistidas localmente para comportamento geral, visualização do calendário e atualizações.
- Controle para ativar ou desativar a verificação automática de atualizações.
- Área de atualização com estado da verificação, versão instalada, versão disponível e changelog do aplicativo.
- Atualizações do desktop assinadas e distribuídas pelo GitHub Releases.

## Arquitetura

O projeto separa a interface, os casos de uso, as regras de domínio e as integrações de plataforma:

```text
Vue UI
  |
Application services
  |
Calendar Engine
  |
Domain models and commands
  |
Repositories, storage and platform adapters
```

O engine não deve depender de Vue, Tauri, APIs do navegador ou de um mecanismo específico de persistência. A interface chama os serviços da aplicação e do engine; ela não deve alterar diretamente o estado de domínio.

### Camadas

- `apps/web`: interface Vue executada no navegador e usada como frontend do desktop.
- `apps/desktop`: shell Tauri, configuração do bundle, permissões e pipeline de atualização.
- `packages/domain`: modelos e contratos do domínio, incluindo workspace, calendário, evento, modelo e camada.
- `packages/engine`: regras de negócio, composição de calendários, seleção, histórico e importação/exportação.
- `packages/application`: casos de uso e serviços que coordenam engine, plataforma e atualização.
- `packages/platform`: portas e adaptadores para recursos do navegador e do desktop.
- `packages/repositories`: repositórios usados para carregar e salvar o estado da aplicação.
- `packages/storage`: implementações de persistência local.
- `packages/selection`: seleção de entidades do domínio.
- `packages/api`: contratos destinados a futuras integrações de API.
- `packages/shared`: tipos e utilitários compartilhados.
- `scripts`: automações de release e tarefas de suporte.

## Estrutura do repositório

```text
.
|-- apps
|   |-- desktop
|   |   `-- src-tauri
|   `-- web
|-- packages
|   |-- api
|   |-- application
|   |-- domain
|   |-- engine
|   |-- platform
|   |-- repositories
|   |-- selection
|   |-- shared
|   `-- storage
|-- scripts
|   |-- changelog
|   `-- release
|-- CHANGELOG.md
|-- CONTRIBUTING_AI.md
|-- LICENSE
`-- package.json
```

## Requisitos

Para desenvolvimento web:

- Node.js 20 ou superior.
- pnpm 9.15.0, conforme definido em `package.json`.

Para desenvolvimento e build desktop:

- Rust stable com os componentes padrão da plataforma.
- Requisitos de build do Tauri para o sistema operacional utilizado.
- No Windows, WebView2 e as ferramentas de compilação MSVC.
- No Linux, as bibliotecas GTK/WebKit e demais dependências do Tauri.

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/JoaEinsson/Cansche.git
cd Cansche
corepack enable
pnpm install
```

Se o Corepack não estiver disponível, instale manualmente o pnpm 9.15.0 antes de executar `pnpm install`.

## Desenvolvimento

Inicie a aplicação web em modo de desenvolvimento:

```bash
pnpm dev
```

Para iniciar a aplicação desktop com Tauri:

```bash
pnpm --filter @cansche/desktop tauri dev
```

O frontend é servido pelo Vite e consumido pelo shell Tauri durante o desenvolvimento.

## Build e testes

Build completo do workspace:

```bash
pnpm build
```

Build somente do frontend web:

```bash
pnpm --filter @cansche/web build
```

Build do aplicativo desktop:

```bash
pnpm --filter @cansche/desktop tauri build
```

Execute os testes automatizados:

```bash
pnpm test
```

Verifique a compilação Rust sem gerar um bundle:

```bash
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked
```

## Atualizações do aplicativo

O atualizador é exclusivo do aplicativo desktop. O Tauri gera artefatos assinados e o workflow de release publica esses artefatos junto com o `latest.json` no GitHub Releases.

A configuração de atualização fica em `apps/desktop/src-tauri/tauri.conf.json` e inclui:

- Artefatos de atualização assinados.
- Chave pública usada para verificar os pacotes.
- Endpoint do release mais recente do repositório.
- Plugin Tauri de atualização e permissões necessárias para reiniciar o aplicativo.

No aplicativo, a configuração de atualização automática controla somente a verificação periódica. A instalação de uma atualização continua sendo apresentada ao usuário para confirmação. A verificação manual permanece disponível mesmo quando a verificação automática está desativada.

Para que um release seja publicado corretamente:

1. Atualize a versão nos três arquivos controlados por `release:set-version`.
2. Adicione uma seção não vazia para a versão em `CHANGELOG.md`.
3. Sincronize o `Cargo.lock` com `cargo check --locked`.
4. Execute a validação do release.
5. Faça o commit e crie a tag no commit validado.
6. Envie a branch e a tag para o repositório remoto.

Exemplo:

```bash
pnpm run release:set-version -- 1.2.0
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked
pnpm run release:validate -- 1.2.0

git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main
git push origin v1.2.0
```

O workflow espera os secrets `TAURI_SIGNING_PRIVATE_KEY` e `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. A chave privada usada no workflow deve corresponder à chave pública versionada na configuração do Tauri.

## Formato de dados

As exportações usam arquivos JSON com extensão `.cansche.json`. O contrato `CanscheFile` inclui:

```json
{
  "format": "cansche",
  "version": 1,
  "type": "calendar",
  "metadata": {
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601",
    "appVersion": "1.2.0"
  },
  "data": {}
}
```

O campo `type` pode ser `calendar` ou `workspace`. O conteúdo de `data` depende do tipo exportado. Mudanças nesse contrato devem ser acompanhadas de testes de importação e exportação.

## Princípios de desenvolvimento

- Manter as regras de negócio independentes da interface e da plataforma.
- Encaminhar mudanças de estado pelo engine e pelos serviços da aplicação.
- Preferir operações em lote a loops de edição na interface.
- Manter adapters de plataforma atrás de contratos estáveis.
- Cobrir mudanças no engine, na persistência e no atualizador com testes automatizados.
- Registrar mudanças de comportamento em `CHANGELOG.md`.
- Evitar introduzir integrações externas antes de estabilizar o núcleo local.

## Escopo atual

Não fazem parte do escopo atual:

- Sincronização com Google Calendar, Outlook ou iCloud.
- Colaboração multiusuário em tempo real.
- Backend obrigatório ou dependência de conexão para uso local.
- CLI, MCP ou sistema de plugins.
- Presets de integração que acoplem o engine a um provedor externo.

Esses itens podem ser avaliados depois que o engine, a persistência e o fluxo de release estiverem estáveis.

## Contribuição

Antes de abrir uma alteração:

1. Leia `ARCHITECTURE.md` e `CONTRIBUTING_AI.md`.
2. Preserve as fronteiras entre interface, aplicação, domínio e plataforma.
3. Execute os testes e as verificações relevantes.
4. Atualize o changelog quando houver mudança observável para o usuário.

## Licença

Este projeto é distribuído sob a licença Apache 2.0. Consulte o arquivo [LICENSE](LICENSE).
