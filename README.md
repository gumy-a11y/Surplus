# Le Surplus

Application de partage de matériaux et outils de chantier entre proches (dons
définitifs et prêts temporaires), avec catalogue filtré par abonnements.

Stack : **Next.js (App Router) + Supabase (auth, base de données, stockage) +
Vercel**.

## Écrans

- `/login` — inscription (email, mot de passe, pseudo) et connexion
- `/catalogue` — objets des personnes suivies, filtres type / catégorie / recherche
- `/mes-objets` — formulaire d'ajout (photo, catégories, don ou prêt, description) + mes objets
- `/abonnements` — liste des contributeurs, suivre / ne plus suivre
- Chaque objet prêté ou donné a un bouton pour changer son statut (disponible → emprunté → disponible, ou → donné)

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com), crée un nouveau projet.
2. Dans **Project Settings → API**, récupère :
   - `Project URL`
   - la clé `anon public`
3. Crée un fichier `.env.local` à la racine (à partir de `.env.local.example`) :

   ```bash
   cp .env.local.example .env.local
   ```

   et colle-y ces deux valeurs :

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   ```

## 2. Exécuter le SQL

Dans le **SQL Editor** de Supabase, exécute ces 3 fichiers **dans cet ordre exact** :

1. `supabase/schema.sql` — le schéma que tu as fourni (tables, catégories, RLS). Non modifié.
2. `supabase/profile_trigger.sql` — **ajout nécessaire** : `schema.sql` ne contient pas de règle RLS permettant à un nouvel utilisateur de créer sa propre ligne dans `profiles`. Ce fichier ajoute un trigger qui crée automatiquement le profil (pseudo compris) dès l'inscription, sans toucher aux tables existantes. Signale-moi si tu préfères une autre approche.
3. `supabase/storage_setup.sql` — **ajout nécessaire** : crée le bucket de stockage public `product-photos` (mentionné mais non créé par `schema.sql`, car un bucket n'est pas un objet SQL classique) et ses règles d'accès (lecture publique, écriture limitée à son propre dossier).

## 3. Authentification

L'authentification email/mot de passe est activée par défaut sur Supabase, il
n'y a rien à faire. Deux options selon ce que tu préfères pour la phase de
test en famille :

- **Avec confirmation par email** (par défaut) : chaque personne doit cliquer
  sur le lien reçu par email avant de pouvoir se connecter.
- **Sans confirmation** (plus simple pour un test rapide entre proches) :
  dans **Authentication → Providers → Email**, désactive *Confirm email*.

## 4. Lancer le projet en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) — tu seras redirigé vers
`/login`.

## 5. Déployer sur Vercel

1. Pousse ce dépôt sur GitHub (déjà fait si tu lis ceci depuis la branche de travail).
2. Sur [vercel.com](https://vercel.com), importe le dépôt.
3. Ajoute les deux variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans les réglages du projet Vercel.
4. Déploie.

## Notes techniques

- Ce projet utilise Next.js 16, qui a renommé le fichier `middleware.ts` en
  `proxy.ts` (voir `src/proxy.ts`) — c'est ce fichier qui protège les pages
  et redirige vers `/login` si tu n'es pas connecté.
- Le filtrage du catalogue (type, catégorie, recherche) se fait côté client
  après récupération des objets des personnes suivies, comme dans le
  prototype fourni.
- Les photos sont redimensionnées dans le navigateur (largeur max ~960px,
  JPEG qualité 0.8) avant l'upload vers Supabase Storage, pour rester léger.
