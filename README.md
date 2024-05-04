# JARVIS-frontend
Repository del progetto di frontend del corso di "Ingegneria del Software" (UniFe) A.A. 2023/2024
## Il team J.A.R.V.I.S.
* [@svevaturola](https://github.com/svevaturola) - Architetto ![GitHub last commit](https://img.shields.io/github/last-commit/svevaturola/JARVIS-frontend?style=flat)
* [@giuliamasina](https://github.com/giuliamasina) - Analista ![GitHub last commit](https://img.shields.io/github/last-commit/giuliamasina/JARVIS-frontend?style=flat)
* [@saravaresco](https://github.com/saravaresco) - Quality Assurance ![GitHub last commit](https://img.shields.io/github/last-commit/saravaresco/JARVIS-frontend?style=flat)
* [@Marco-178](https://github.com/Marco-178) - Frontend/UX-UI ![GitHub last commit](https://img.shields.io/github/last-commit/Marco-178/JARVIS-frontend?style=flat)
* [@lucadomene](https://github.com/lucadomene) - Backend/UX-UI ![GitHub last commit](https://img.shields.io/github/last-commit/lucadomene/JARVIS-frontend?style=flat)

## Setup IDE

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (e disabilitare Vetur).

## Supporto per gli import dei file tipo `.vue` Imports in TS

Di default TypeScript non è in grado di gestire le informazioni del tipo `.vue`, perciò bisogna rimpiazzare l'interfaccia a linea di comando `tsc`(sta per Typescript Compiler) con `vue-tsc` per il type checking. Negli editor si usa [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) per permettere al linguaggio Typescript di riconoscere il tipo `.vue`.

## Personalizzare la configurazione

Vedere [Vite Configuration Reference](https://vitejs.dev/config/).

## Setup del progetto

```sh
npm install
```

### Compilazione e Hot-Reload per lo sviluppo

```sh
npm run dev
```

### Type-Check, Compilazione e Minificazione per la fase di Produzione

```sh
npm run build
```

### Analisi statica del codice con [ESLint](https://eslint.org/)

```sh
npm run lint
```
