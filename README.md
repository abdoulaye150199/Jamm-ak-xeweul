# Jamm-ak-xeweul

## Administration

- Connexion administrateur : `/login/admin`
- Tableau de bord protégé : `/admin`
- Les identifiants sont définis dans `.env.local` avec `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `ADMIN_SESSION_SECRET`.

## Développement

1. Copier `.env.example` vers `.env.local` et renseigner des valeurs propres à l’environnement.
2. Installer les dépendances avec `npm install`.
3. Appliquer les migrations avec `npm run db:migrate`.
4. Lancer l’application avec `npm run dev`.

Le projet utilise ESLint avec les règles Next.js. Si les dépendances ne sont pas encore présentes dans `node_modules`, lancer `npm install` puis `npm run lint`.

Les comptes membres utilisent une session sécurisée par cookie HttpOnly. Après une modification du schéma, les migrations doivent être appliquées avant de tester l’inscription.

Le `middleware.ts` protège l’accès aux routes `/admin/*`. Les Route Handlers conservent aussi une vérification serveur indépendante avant toute opération d’administration.

## Mode BFF / microservices

Par défaut, l’application utilise son adaptateur Neon local. Pour activer le BFF vers le backend, renseigner `BACKEND_API_URL` dans `.env.local`. Les Route Handlers `/api/members`, `/api/contributions` et `/api/admin/*` transmettent alors les requêtes au backend, en conservant les cookies et un identifiant `x-request-id`.

Contrats attendus côté backend : `/members`, `/auth/login`, `/auth/admin/login`, `/auth/logout`, `/contributions`, `/admin/dashboard`, `/admin/events` et `/admin/notifications`.

La limitation des tentatives est actuellement en mémoire du processus Next.js. En production multi-instance, elle doit être remplacée par un stockage partagé comme Redis.
