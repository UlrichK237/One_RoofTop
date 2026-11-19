# Éléments en attente de confirmation client : One Rooftop

Ce document liste tous les drapeaux encore à `false` dans `src/data/confirmations.ts` et ce qui reste volontairement masqué sur le site public tant que le restaurant n’a pas donné son accord écrit.

## Drapeaux actuellement à `false` dans `src/data/confirmations.ts`

| Clé dans `CONFIRME` | Élément actuellement masqué sur le site | Question à poser au restaurant |
| --- | --- | --- |
| `horaires` | Grille des horaires par jour dans « Réserver & Accès », statut « Ouvert / Ouvre à… » dans le hero, et liste de créneaux contraints dans le formulaire (remplacée par une saisie d’heure libre). | Confirmez-vous vos horaires exacts jour par jour (Lundi 16h à 01h, Mardi au Vendredi 16h à 02h, Samedi 17h à 04h, Dimanche 16h à 02h) ? |
| `emailReservation` | Adresse e-mail dans le bloc « Adresse et accès ». | Souhaitez-vous afficher `reservation@one-rooftop.com` sur le site comme canal de contact ? |
| `auDessusDeBombayMasala` | Repère « au-dessus de Bombay Masala » sous le titre principal et sous l’adresse. | Confirmez-vous que nous pouvons mentionner la situation « au-dessus de Bombay Masala » ? |
| `salleClimatisee` | Mention d’une salle intérieure climatisée (hero, services, libellé de préférence en réservation). | Disposez-vous bien d’une salle intérieure climatisée en plus de la terrasse ? |
| `jacaranda` | Branches du jacaranda sur le dessin de façade SVG et carte dédiée dans l’étage Soirées. | Le jacaranda lumineux est-il toujours installé au centre du bar et souhaitez-vous le mettre en avant ? |
| `musiqueLive` | Mention de musique live et barres d’égaliseur dans l’étage Soirées. | Proposez-vous actuellement des soirées avec musique live, et quels jours ? |
| `dj` | Mention de programmation DJ dans l’étage Soirées. | Proposez-vous une programmation DJ régulière ? |
| `venteAEmporter` | Boutons d’ajout à la commande, icône Panier en en-tête et mode « À emporter » du tiroir panier. | Proposez-vous la commande à emporter via WhatsApp ou par téléphone ? |
| `livraison` | Mode « Livraison », champ adresse et panier de commande. | Proposez-vous la livraison à Douala (et dans quels quartiers / conditions) ? |
| `traiteur` | Mention du service traiteur dans les services et l’étage Soirées. | Proposez-vous un service traiteur pour des événements ? |
| `privatisation` | Mention de privatisation d’espace et étage Soirées dédié. | Proposez-vous la privatisation totale ou partielle de la terrasse ou d’un salon ? |
| `optionsVegetariennes` | Bouton de filtre « Végétarien (V) » sur la carte et ligne « Options végétariennes ». | Confirmez-vous que la carte actuelle propose des options végétariennes identifiées ? |
| `optionsHalal` | Mention « Options halal » dans les services sur place. | Proposez-vous des plats certifiés ou préparés selon des règles halal ? |
| `parking` | Mention « Parking » dans les services sur place. | Un parking dédié ou gardé est-il mis à disposition des clients devant le 1163 rue Njo-Njo ? |
| `paiementNfc` | Mention « Paiement mobile NFC » dans les services sur place. | Acceptez-vous le paiement sans contact NFC / cartes bancaires sur place ? |
| `accessibilitePmr` | Mention « Accès PMR » dans les services sur place. | L’accès à la salle et au rooftop est-il équipé pour les personnes à mobilité réduite (ascenseur ou rampe) ? |

## Autres éléments attendus

1. **Numéro WhatsApp dédié** : confirmer si `+237 671 03 33 33` reçoit bien les messages WhatsApp (pour renseigner `VITE_WHATSAPP_NUMBER`).
2. **Photographies du lieu et des plats** : déposer les photos officielles dans `public/photos/lieu/` avec un fichier `manifest.json` (`fichier`, `legende`, `credit`, `emplacement`) et dans `public/photos/` via `src/data/platPhotos.json` pour les plats.
3. **Vérification typographique de la carte** : valider les corrections listées dans `docs/a-verifier.md` et transmettre la page éventuellement manquante entre *Tuna Truffle* et *Red Dragon Roll*.
