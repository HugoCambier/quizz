# ADR 0002 : comptes et contributions

Date : 2026-10-25 · Statut : proposée (v1 livrée en local, backend à brancher)

## Contexte

N'importe qui doit pouvoir proposer des questions, les commenter et les signaler. Chacun doit garder
ses contributions et définir son profil, d'où la nécessité d'un login.

## Décision

1. Deux notions distinctes :
   - le **compte**, c'est-à-dire qui contribue et qui possède ;
   - le **profil joueur**, c'est-à-dire qui joue autour de la table.

   Un compte possède plusieurs profils : un parent gère les profils de ses enfants, et un appareil
   partagé en soirée accueille des invités sans compte.

2. Trois types de contribution signés par un compte :
   - la proposition de question (`pending` puis `approved` ou `rejected`) ;
   - le signalement (`open` puis `resolved`, avec un motif parmi une liste fermée) ;
   - le commentaire.
3. Le repository des contributions est asynchrone dès la v1. L'adapter local sera remplacé par un
   adapter Supabase sans toucher l'UI.
4. Backend cible : Supabase, déjà utilisé par le prototype.
   - Auth : lien magique par email et Google.
   - Postgres + RLS :
     - chacun lit tout et n'écrit que ses lignes ;
     - les modérateurs changent les statuts ;
     - une proposition validée est copiée dans `questions`.
   - Realtime pour les salons en ligne (v1.2).

## En v1 (local)

- Le compte est un pseudo local (`provider: "local"`), demandé au premier signalement ou à la première proposition.
- La modération est locale : elle décide de ce que cet appareil joue. Les questions proposées sont
  jouables tout de suite sur l'appareil de leur auteur.
- « Exporter les questions » produit un JSON à intégrer dans la banque (skill `add-questions`).

## Pour brancher Supabase

- Ajouter `accountSchema.provider: "supabase"`, et un `createSupabaseContributionsRepository` qui
  implémente `ContributionsRepository`.
- Remplacer `AccountGate` par l'écran de connexion. Ses appelants ne changent pas.
- Tables : `accounts`, `player_profiles` (owner_id), `contributions` (kind, status, payload jsonb,
  author_id), `questions` (banque partagée, versionnée).
- Migrer les données locales au premier login : profils, historiques et contributions sont rattachés
  au compte.
