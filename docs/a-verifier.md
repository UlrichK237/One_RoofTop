# Éléments à vérifier et à confirmer — One Rooftop (Bonapriso, Douala)

Document interne de suivi. Ne pas inclure dans le build ni afficher sur le site.

## 1. Sources utilisées
- **Source A** : Fiche textuelle fournie (`information_One_Rooftop_2b3418fb.txt`).
- **Source B** : Captures de la carte officielle FlipHTML5 fournies par le client (19 vues : `FOOD MENU` et `DRINKS MENU`).
- **Source C** : Fichiers logo fournis (`IMG_5525_606dba31.webp`, `IMG_5526_86b55545.jpeg`).

## 2. Données critiques et niveaux de confiance

| Donnée | Valeur relevée | Source | Niveau de confiance | Action requise |
| --- | --- | --- | --- | --- |
| Nom de l’établissement | One Rooftop (logo : ONE ROOFTOP BAR & LOUNGE) | Source A & C | Élevé | — |
| Quartier & adresse | 1163, rue Njo-Njo, Bonapriso, Douala (au-dessus de Bombay Masala, près de la station MRS) | Source A | Moyen-Élevé | Confirmer l’adresse exacte de réception |
| Coordonnées GPS | 4.0282, 9.6989 (approximatives) | Source A | Moyen | Confirmer le lien Google Maps exact |
| Téléphone | +237 671 03 33 33 | Source A | Moyen | Confirmer que le numéro est actif |
| WhatsApp | Non précisé explicitement | Source A | Faible (non confirmé) | Confirmer si +237 671 03 33 33 sert aussi pour WhatsApp, ou fournir un numéro dédié |
| E-mail | reservation@one-rooftop.com | Source A | Moyen | Confirmer si utilisé ou non sur le site |
| Horaires d’ouverture | Lun 16h–01h, Mar–Ven 16h–02h, Sam 17h–04h, Dim 16h–02h | Source A | Faible (« peuvent varier légèrement selon les sources ») | Confirmer jour par jour auprès du restaurant |
| Vente à emporter / Livraison | Mentionnées dans Source A, non confirmées | Source A | Faible | Confirmer disponibilité, zones et frais éventuels |
| Réservation / Privatisation / Soirées | Mentionnées dans Source A, non confirmées | Source A | Faible | Confirmer avant tout affichage (exigence client) |
| Services annexes (parking, NFC, PMR, halal, DJ/live) | Mentionnés dans Source A, non confirmés | Source A | Faible | Ne pas afficher sans confirmation explicite |
| Prix et références de la carte | Relevés sur captures FlipHTML5 | Source B | Élevé (sur les pages fournies) | Confirmer qu’aucun tarif n’a évolué depuis l’édition des captures |

## 3. Écarts et manques entre les sources

### Pages manquantes de la carte (Source B)
- **Image manquante entre `photo_1` et `photo_3`** (`photo_2` absente) : la fin des *California Signature Rolls* s’arrête à *Tuna Truffle* et reprend en haut de page suivante sur *Red Dragon Roll*. Il manque probablement le titre de section de ces rolls spéciaux (ou une page de salades/entrées/rolls).
- **Plats cités dans la Source A mais absents des captures de carte fournies** :
  - Ailes de poulet BBQ
  - Poulet braisé épicé
  - Poulet Buna
  - Toasts au pesto
  - Salade de crabe
  - Glaces (hors accompagnement Banana Split / Apple Pie)
  - Cocktails classiques (ex. Mojito à la menthe fraîche) et éventuellement une page de vins rouges supplémentaires ou spiritueux manquants.

### Anomalies de saisie relevées sur les captures de la carte (Source B)
- **SALMON KATSU** (`SUSHI / KATSU`) : la description indique `Deep-Fried Tuna Sashimi With Panko` (copier-coller probable de *Tuna Katsu* — à vérifier s’il faut corriger en `Salmon` avant mise en ligne).
- **SIGNATURE COCKTAILS** (`photo_18`, `photo_19`) : l’entête de colonne droite indique `Bottle` alors que les tarifs (12 500 à 22 000 FCFA) correspondent vraisemblablement au verre.
- **THE ONE ROOFTOP CLASSIC CHEESEBURGER** : mention `(Extra Egg 2.000 Fcfa)` sous le prix de 11 000 FCFA ; confirmer si ce supplément est commandable à part ou en option payante.
- **Fautes d’orthographe relevées** (regroupées dans `src/data/corrections.json`, non appliquées sans validation) :
  - `Shitake` -> `Shiitake`
  - `Siracha` -> `Sriracha`
  - `SALMON CALIFORNIA RO L` -> `SALMON CALIFORNIA ROLL`
  - `All of our is imported` -> `All of our beef is imported`
  - `Cinamon` -> `Cinnamon`
  - `Supermount` -> `Supermont`
  - `Decaffienato` -> `Decaffeinato`
  - `Câteau Chauvin` -> `Château Chauvin`
  - `Cantermerle` -> `Cantemerle`
  - `Carbonieux` -> `Carbonnieux`
  - `Châteaux Giscours` -> `Château Giscours`
  - `Le Sirène De Giscours` -> `La Sirène De Giscours`
  - `D'arssac` -> `D'Arsac`
  - `Moussaç` -> `Moussas`
  - `Sergant Lalande de Pomerol` -> `Sarget de Gruaud-Larose` ou `Sergent Lalande de Pomerol` (à confirmer selon l’étiquette exacte en cave)
  - `Lalande-Bore` -> `Lalande-Borie`
  - `Aspirant de Beychevelle` -> `Amiral de Beychevelle`
  - `W Black Label` -> `JW Black Label`
  - `Yamazaki Reverse` -> `Yamazaki Reserve`
  - `Glanmorangie` -> `Glenmorangie`
  - `Bombay Saphire` -> `Bombay Sapphire`
  - `Tequilla` -> `Tequila`

## 4. Photos fournies
- Seuls les deux fichiers du logo et les captures FlipHTML5 du menu ont été transmis pour l’instant.
- Aucune photo de plat ni de salle n’est disponible : selon les consignes du client, aucune photo « approchante » externe ne sera utilisée. À demander au restaurant pour illustrer les fiches plats et l’espace rooftop.
