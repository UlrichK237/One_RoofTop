# Liste de contrôle avant mise en ligne — One Rooftop

| Point à confirmer avec le restaurant | État actuel | Endroit exact du code à ajuster |
| --- | --- | --- |
| Numéro WhatsApp actif pour recevoir commandes et réservations | Désactivé par défaut (`null`) pour sécurité | `.env` / variable d’environnement `VITE_WHATSAPP_NUMBER` (ou constante `CONFIG_WHATSAPP_NUMBER` dans `src/engine/whatsapp.ts` ligne 7) |
| Photos officielles du restaurant (terrasse, salle, plats, cocktails) | Emplacements prêts sans photo externe | Dossier `public/photos/` + table de correspondance `src/data/platPhotos.json` (clé `categorie::nom`) |
| Validation des 21 corrections orthographiques de la carte | Proposées dans le fichier de corrections, textes originaux conservés | `src/data/corrections.json` puis mise à jour des libellés dans `src/data/restaurantData.ts` |
| Description de `SALMON KATSU` (`Tuna` écrit au lieu de `Salmon`) | Reprise telle quelle depuis la carte fournie | `src/data/restaurantData.ts` (plat `id: 'kt-2'`) |
| Vue manquante entre `Tuna Truffle` et `Red Dragon Roll` (et plats sans prix dans la fiche texte : ailes BBQ, poulet braisé, poulet Buna, salade de crabe, toasts au pesto, mojito classique) | Non affichés sans prix confirmé | `src/data/restaurantData.ts` (catégories `sushi` et autres catégories concernées) |
| Livraison : zones desservies et frais éventuels | Mention confirmative neutre affichée sans frais inventés | `src/data/textesSite.ts` (`panier.infoLivraison`) et `src/engine/whatsapp.ts` |
| Lien exact de la fiche Google Maps officielle | Recherche sur coordonnées approximatives `4.0282, 9.6989` | `src/data/restaurantData.ts` (`lieux.maps_url` ligne 86) |
