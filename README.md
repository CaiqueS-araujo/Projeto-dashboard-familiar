
# Cofre — Finanças da Família

Painel financeiro privado para você e a Carol administrarem receitas, despesas, categorias e metas de economia juntos, em tempo real.

Só vocês dois conseguem entrar. Ninguém mais consegue ler ou escrever nada — mesmo que descubra a URL do site.

## Novidades desta versão

- **Navegação**: barra de baixo agora é Início, Financeiro, Academia, Mercado, Conquistas. "Financeiro" abre um menu com Lançamentos, Contas fixas, Categorias, Metas e Investimentos.
- **Academia**: a sequência de treinos tolera até 3 dias de descanso seguidos entre uma ida e outra — só zera se faltar 4 dias seguidos ou mais.
- **Conquistas**: agora tem hábitos diários (ex: beber 2L de água), pessoais ou da família, marcáveis também direto na Visão Geral. As trilhas de Academia mostram só a da pessoa selecionada no momento; a trilha "Financeiro da família" continua valendo pros dois.
- Coleções novas no Firestore: `dailyHabits` e `dailyHabitLogs` — já cobertas nas regras de segurança (`firebase/firestore.rules`). Rode `firebase deploy --only firestore:rules,firestore:indexes` de novo pra publicar.
