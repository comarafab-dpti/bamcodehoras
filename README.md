# COMARA — Portal do Colaborador

Portal de autoatendimento para consulta de **Banco de Horas SPTF**, **Insalubridade (NR-15)** e **Contracheques** dos colaboradores da COMARA.

> **Domínio de produção:** `bancodehoras.ai.studio`

## Funcionalidades

- **Login por matrícula/CPF e senha** (autoatendimento local ou via Cloud Function com Custom Token)
- **Consulta de saldo de banco de horas** com extrato detalhado e filtros de período
- **Consulta de insalubridade** (enquadramento NR-15 e apontamentos episódicos)
- **Consulta de contracheques** (demonstrativos de pagamento)
- **PWA instalável** com suporte offline e tema claro/escuro
- **Sessão com timeout por inatividade** (auto-logoff)

## Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4**
- **Firebase** (Firestore + Auth com Custom Token)
- **Lucide React** (ícones)

## Como rodar

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (porta 3000)
npm run dev

# Build de produção
npm run build

# Verificar tipos
npx tsc --noEmit

# Preview do build
npm run preview
```

## Estrutura do projeto

```
├── index.html              → Redireciona / para /portal
├── portal.html             → Entry point do portal
├── src/
│   ├── main.tsx             → Roteamento simples (→ portal)
│   ├── portal/              → Aplicação do portal do colaborador
│   │   ├── App.tsx
│   │   ├── CollaboratorLandingView.tsx
│   │   ├── ContrachequeMirrorView.tsx
│   │   ├── ForgotPasswordModal.tsx
│   │   └── LgpdConsentBanner.tsx
│   └── shared/              → Serviços, tipos e componentes compartilhados
│       ├── components/       → UI reutilizável (logo, badges, modais PWA)
│       ├── constants/        → Dados padrão e design tokens
│       ├── contexts/         → InstitutionContext
│       ├── hooks/            → useIdleTimer, useOnlineStatus, usePWAInstall
│       ├── services/         → authService, firestoreService, firebase, etc.
│       ├── types.ts          → Tipos do domínio
│       └── utils/            → lgpdUtils
├── public/                  → Manifest PWA, ícones, service worker
├── firestore.rules           → Regras de segurança do Firestore (portal + admin residual)
└── firebase.json             → Configuração do Firebase
```

## Autenticação do colaborador

O portal suporta dois modos de autenticação:

1. **Cloud Function (produção):** Quando `VITE_EMPLOYEE_AUTH_FUNCTION_URL` está configurada, o portal envia matrícula+senha para a Function, que retorna um Custom Token do Firebase. O token contém a claim `matricula` usada nas regras do Firestore para filtrar os dados do colaborador.

2. **Modo local (desenvolvimento):** Sem a Function configurada, o portal usa dados em cache local (`localStorage`) para simular o login e a consulta.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_EMPLOYEE_AUTH_FUNCTION_URL` | URL da Cloud Function de autenticação de colaboradores (opcional em dev) |

## Regras do Firestore

O arquivo `firestore.rules` mantém:
- **Leitura pública** de `institution_settings` e `system_config`
- **Leitura do próprio colaborador** (via `request.auth.token.matricula`) para `colaboradores`, `lancamentos`, `insalubridade_records`, `contracheques` e `dispensas_sptf`
- **Acesso residual de administradores** para gestão externa (via `admin_users`)

Para publicar as regras: `npm run deploy:rules`

## Testes

Os testes restantes cobrem autenticação de colaborador e serviços compartilhados:

```bash
npx tsx src/shared/services/employeePublicAuth.test.ts
npx tsx src/shared/services/rbacService.test.ts
npx tsx src/shared/services/canteiroService.test.ts
npx tsx src/shared/constants/unidadesOrganizacionais.test.ts
```
