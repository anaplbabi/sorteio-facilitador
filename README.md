# Sorteador de Facilitadores

Site para sortear facilitadores das reuniões semanais (Daily, Cards de Operação e Monitoramento).

## Funcionalidades

- Sorteio de facilitadores para três tipos de reuniões:
  - **Daily**: Sorteia entre todas as pessoas
  - **Cards de Operação**: Sorteia apenas do subgrupo específico
  - **Monitoramento**: Sorteia apenas do subgrupo específico
- Prevenção de repetição: A mesma pessoa não pode ser sorteada duas semanas seguidas para a mesma reunião
- Histórico: Mostra quem foi sorteado na semana atual e na semana passada
- Armazenamento local: Os dados são salvos no navegador

## Como usar

1. Configure as pessoas:
   - Adicione todas as pessoas na primeira caixa de texto (uma por linha)
   - Adicione o subgrupo para Cards de Operação e Monitoramento na segunda caixa (uma por linha)
   - Clique em "Salvar Configuração"

2. Sorteie os facilitadores:
   - Clique nos botões "Sortear" para cada reunião
   - O resultado aparecerá destacado

3. Ao final da semana:
   - Clique em "Resetar Semana" para mover os resultados para o histórico e começar uma nova semana

## Deploy no GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload dos arquivos (index.html, style.css, script.js)
3. Vá em Settings > Pages
4. Selecione a branch main (ou master) e a pasta / (root)
5. Clique em Save
6. Seu site estará disponível em: `https://seu-usuario.github.io/nome-do-repositorio`

## Estrutura de arquivos

```
.
├── index.html      # Página principal
├── style.css       # Estilos
├── script.js        # Lógica de sorteio
└── README.md       # Este arquivo
```

