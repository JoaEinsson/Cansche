# Changelog

Todas as alterações relevantes do Cansche serão documentadas neste arquivo.

O projeto segue Semantic Versioning.

---

## [Unreleased]

### Added

-

### Changed

-

### Fixed

-

---

## [1.2.0] - 2026-08-04

### Added

- Tela de configurações para preferências gerais, calendário, dados, atualizações e informações do aplicativo
- Controle para ativar ou desativar a verificação automática de atualizações
- Indicador persistente de atualização no cabeçalho, com versão instalada, status e changelog
- Exibição das novidades da versão atual na seção Sobre

### Fixed

- Corrigida a identificação da versão instalada pelo atualizador desktop
- Corrigada a geração de artefatos assinados e a permissão para verificar e instalar atualizações
- Corrigido o reinício do aplicativo após a instalação de uma atualização
- Erros de verificação agora são exibidos como erro, em vez de serem tratados como aplicativo atualizado

### Changed

- Atualizado o pipeline de release para validar versão, changelog e artefatos do updater

---

## [1.1.0] - 2026-08-02

### Added

- Sistema de atualização automática com verificação silenciosa na inicialização
- Diálogo discreto no estilo VS Code para notificar sobre novas versões
- Opção "Verificar Atualizações" na Paleta de Comandos (Ctrl+K)
- Biblioteca de modelos organizada por categorias expansíveis (sanfona)
- Persistência do estado de categorias colapsadas entre sessões

### Fixed

- Restaurada a seleção contínua de dias ao arrastar o mouse
- Restaurada a bolinha indicadora do dia de hoje no canto superior da célula

### Changed

- Melhoria na ordenação interna dos modelos da biblioteca
