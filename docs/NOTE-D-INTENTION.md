# Note d’intention : Le site de One Rooftop

## L’idée du design

Le site reprend la géométrie en rectangles et la silhouette en élévation du logo **One Rooftop** pour raconter la montée depuis la rue Njo-Njo jusqu’à la terrasse : chaque grande partie de l’établissement correspond à un étage. Le visiteur passe du rez-de-chaussée (accueil et statut d’ouverture) au premier étage consacré au bar et aux cocktails, puis à la cuisine et aux grillades au charbon, à la cave de vins et spiritueux, aux soirées et espaces privatisables, jusqu’au toit où l’on réserve sa table.

Les teintes du site prolongent celles de l’identité visuelle du lieu : un fond nuit chaud (`#231D1F`), des panneaux sombres (`#2E2629`), du texte ivoire très lisible (`#F3E9D8`), des filets fins couleur bronze (`#96650B`) inspirés du dessin architectural du logo, et l’or (`#CA8C3A`) réservé aux repères d’étage et aux boutons principaux. Deux polices locales accompagnent cette lecture : des titres espacés nets pour les noms de plats et des descriptions en italique classique pour la lecture à table.

## Ce que le site permet

- **Consulter l’ensemble de la carte** sur mobile comme sur ordinateur, avec recherche instantanée (sans tenir compte des accents), filtres végétarien `(V)` et faible en calories `(LC)`, bascule français / anglais et impression propre sur feuille A4.
- **Préparer une sélection** (à emporter ou en livraison) dans un panier conservé 24 heures, avec choix des formats (*Verre / Bouteille*, options) et recalcul automatique des montants en FCFA.
- **Demander une table** à l’horaire exact d’ouverture (y compris pour les créneaux tardifs après minuit les mardis au dimanches), et envoyer la demande en un geste vers WhatsApp, par copie du message ou par appel direct.
- **Accueillir vos photographies** : les cadres photo de la façade, de la terrasse, de la salle et de chaque fiche plat sont déjà en place et prêts à afficher vos clichés officiels dès leur transmission, sans aucune photo d’emprunt extérieure.

## Comment le site se met à jour

Les informations du restaurant, les horaires et l’intégralité de la carte sont centralisés dans un fichier unique de données (`src/data/restaurantData.ts`). Modifier un prix, ajouter un plat, activer ou masquer un créneau ou ajouter les photos du restaurant dans le dossier `public/photos/` se fait sans toucher à la structure des pages ni à la logique du panier.

## Ce qui reste à confirmer avant ouverture publique

1. Indiquer si le numéro `+237 671 03 33 33` sert bien à recevoir les messages WhatsApp (ou communiquer le numéro WhatsApp dédié).
2. Transmettre les photographies officielles de la façade, du jacaranda lumineux, de la salle et des plats.
3. Valider la liste des corrections typographiques relevées sur l’édition imprimée actuelle et transmettre les éventuelles pages manquantes (entre *Tuna Truffle* et *Red Dragon Roll*).

## Les mouvements du site

Le site suit le principe architectural d’une montée d’étage en étage grâce à des animations légères, sans aucune bibliothèque externe :

- **Allumage de l’accueil** : la façade et la grille géométrique du logo se tracent dès l’ouverture (sautables au clic ou par touche), suivies d’une lueur discrète guidée par le pointeur.
- **Ascenseur et portes d’étages** : un repère vertical suit la progression du visiteur dans la marge sur grand écran, ou se replie en pastille compacte avec anneau sur tablette et mobile pour ne jamais gêner la lecture. Des portes en filets de bronze s’écartent entre les étages au défilement.
- **Scènes dessinées et carte vivante** : chaque étage affiche une scène vectorielle dédiée (bar, grillades, cave, soirées, sommet) qui se met automatiquement en pause hors écran, prête à accueillir les photographies officielles du lieu avec un lent zoom cinématographique dès qu’elles seront déposées. Les onglets de la carte soulignent leur sélection en continu et les boutons principaux réagissent discrètement au pointeur et au toucher.
- **Maîtrise totale par le visiteur** : les préférences système de réduction des mouvements sont respectées automatiquement, et un bouton en pied de page permet de passer des mouvements complets aux mouvements réduits ou de les couper entièrement.

## Sécurité et confidentialité

Le site fonctionne sans cookies publicitaires, sans suivi statistique et sans appel à des serveurs tiers pour les polices ou les images. Aucune donnée personnelle (nom, téléphone, adresse) n’est enregistrée : seul le panier de sélection est gardé dans le navigateur pendant 24 heures. Des en-têtes de sécurité stricts bloquent l’intégration du site dans des cadres externes et protègent les saisies contre toute injection.
