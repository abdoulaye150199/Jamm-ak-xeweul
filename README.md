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

Dans `/admin/membres`, les actions « Détails » et « Supprimer » permettent de consulter le profil et ses contributions récentes, puis de supprimer le compte après confirmation. La suppression retire les notifications personnelles et bloque l’ancienne session du membre. Ses contributions restent disponibles pour le suivi administratif.

## Contributions et notifications

Les membres peuvent envoyer un besoin ou une idée avec une photo PNG, JPEG, WebP ou GIF de 1,5 Mo maximum. Les formulaires publics acceptent les mêmes photos. L’administration peut approuver les contributions ; les activités publiées génèrent des notifications pour les membres.

La récupération de mot de passe et les accusés de réception par e-mail sont reportés. Aucun serveur de messagerie n’est nécessaire pour les fonctions actuelles.

Les requêtes Neon simples utilisent HTTP. Les transactions utilisent WebSocket avec un délai de connexion limité. Les lectures sont réessayées jusqu’à trois fois en cas d’erreur réseau temporaire ; les écritures ne sont pas rejouées automatiquement.

## Vérifications

Lancer `npm test`, `npm run lint` et `npm run build` avant de publier les modifications. Les tests couvrent les sessions, les mots de passe, la limitation des tentatives, les entrées des API et la reprise des lectures Neon.

Pour tester les détails et la suppression des membres, lancer `npm run build`, démarrer `npm run start -- --hostname 127.0.0.1 --port 3100`, puis lancer `TEST_BASE_URL=http://127.0.0.1:3100 npm run test:integration`. Ce test utilise les identifiants de `.env.local`, crée uniquement des comptes temporaires et nettoie ses données à la fin. Sans `TEST_BASE_URL`, il est ignoré par `npm test`.

## Mode BFF / microservices

Par défaut, l’application utilise son adaptateur Neon local. Pour activer le BFF vers le backend, renseigner `BACKEND_API_URL` dans `.env.local`. Les Route Handlers `/api/members`, `/api/contributions` et `/api/admin/*` transmettent alors les requêtes au backend, en conservant les cookies et un identifiant `x-request-id`.

Contrats attendus côté backend : `/members`, `/auth/login`, `/auth/admin/login`, `/auth/logout`, `/contributions`, `/admin/dashboard`, `/admin/events`, `/admin/notifications` et `/admin/members/:id` (GET pour les détails, DELETE pour la suppression).

La limitation des tentatives est actuellement en mémoire du processus Next.js. En production multi-instance, elle doit être remplacée par un stockage partagé comme Redis.
