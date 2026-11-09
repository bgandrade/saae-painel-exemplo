# Contribuir

Este repositório reúne a proposta técnica de digitalização, automação e controle operacional
desenvolvida por Bruno Andrade como iniciativa pessoal apresentada ao SAAE de Angra dos Reis. A
proposta é o material central do portfólio; o simulador é uma demonstração de apoio. Contribuições
são bem-vindas para fins demonstrativos e educacionais; não há compromisso de suporte, prazo de
resposta ou implantação operacional.

## Relatar problemas

Para observações sobre a proposta, indique a seção, a premissa ou a referência discutida e explique
a correção sugerida. Para problemas na demonstração, indique a tela ou comando afetado, passos para
reproduzir, resultado esperado e observado, navegador e versão do Node quando relevantes. Inclua o
cenário e a velocidade da simulação. Não envie credenciais, dados pessoais ou informações
operacionais internas.

## Propor alterações

Explique o problema resolvido e mantenha a alteração focada. Preserve os avisos de simulação, a
identificação de autoria, os intertravamentos demonstrados e as atribuições de terceiros. Não
introduza dados reais internos ou imagens sem permissão de redistribuição.

Instale as dependências conforme o README e execute antes de enviar:

```bash
pnpm lint
pnpm format:check
pnpm check
pnpm build
pnpm documento:html
```

Confira alterações visuais no navegador. Se modificar `docs/proposta-tecnica.md` ou seu CSS, execute
`pnpm documento:pdf`, revise o documento e inclua o PDF atualizado no mesmo commit. O comando requer
Chromium/Chrome, conforme descrito no README. Os testes de renderização não validam layout nem
substituem essa revisão.

O código e a documentação autorais são disponibilizados sob MIT. Ao contribuir, disponibilize suas
contribuições autorais sob essa licença. Materiais de terceiros devem trazer origem, atribuição e
condições de uso compatíveis, registradas na documentação da contribuição.
