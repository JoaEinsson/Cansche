# AI Development Rules

## Antes de implementar

Sempre verificar se a funcionalidade fortalece o Calendar Engine.

Nunca adicionar lógica de negócio na UI.

Nunca acessar o Storage diretamente pela interface.

Toda lógica deve ficar no Engine.

## Código

- TypeScript estrito.
- Código pequeno e modular.
- Preferir composição.
- Evitar dependências desnecessárias.
- Criar testes para o Engine.

## Arquitetura

A UI apenas renderiza.

O Engine contém toda a lógica.

Storage é substituível.

## Filosofia

Antes de criar uma funcionalidade, responder:

"Isso melhora a edição em lote?"

Se não melhorar, discutir antes de implementar.

## Prioridade

1. Engine
2. Testes
3. UI
4. Performance
5. Integrações

Nunca inverter essa ordem.