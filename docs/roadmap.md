# Roadmap

Le jeu de soirée est la porte d'entrée : il fait venir des joueurs, et chacun crée un profil
(centres d'intérêt, niveau). Le hub construit ensuite d'autres usages sur les mêmes briques :
thèmes, niveaux, banque de questions, historique par joueur, contributions.

## v1 (cette branche)

- Profils joueurs : avatar, couleur, centres d'intérêt, niveau habituel, réussite par thème.
- Quiz local sur un seul appareil :
  - trois ambiances (Soirée, Famille, Entraînement) ;
  - réponse chacun son tour, ou animateur/buzzer ;
  - jeu en solo ou en équipes ;
  - difficulté fixe, au niveau de chacun ou progressive ;
  - points fixes ou selon la difficulté.
- Deck sans répétition et équilibré sur les centres d'intérêt, reproductible à partir d'un seed.
- Contributions : proposer une question, la commenter ou la signaler (signature par pseudo), modération
  locale, export vers la banque.
- 360 questions, 12 thèmes, 10 niveaux. CI et déploiement sur GitHub Pages.

## v1.1 : comptes et contributions partagées (ADR 0002)

- Login avec Supabase Auth (lien magique + Google). Le compte possède des profils joueurs et des contributions.
- Contributions en base, partagées entre tous, avec un rôle modérateur et une file de modération. Les
  questions validées entrent dans la banque commune.
- Synchronisation des profils et des historiques entre appareils.

## v1.2 : en ligne

- Salon éphémère : un code à 4 lettres, chacun joue sur son téléphone, l'hôte affiche la question sur
  la TV (Supabase Realtime). Le deck étant déterminé par son seed, il suffit de partager le seed et la
  configuration.
- Défi asynchrone « contre le reste du monde » : même seed pour tout le monde sur une journée, avec
  un classement.

## v2 : au-delà du jeu

- **Révision** : répétition espacée (SM-2 ou FSRS) sur les historiques de réponses déjà collectés ;
  decks thématiques poussés (médecine, concours, code de la route…) et decks enfants.
- **Planning** : sessions de révision planifiées, pour soi ou pour une équipe (service hospitalier,
  promo d'étudiants). C'est le levier d'adoption dans le médical.
- Formats de question : vrai/faux, image, estimation numérique, ordre chronologique.

## Pistes business

- Freemium : quiz gratuit, packs thématiques premium, decks de révision pro.
- B2B : formation interne (onboarding, conformité) avec ses propres questions, plus planning et suivi.
- Éducation : decks par niveau scolaire, suivi parent.
- Événementiel : salons éphémères en marque blanche (soirées d'entreprise, bars à quiz).
