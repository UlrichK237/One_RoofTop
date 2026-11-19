import { CONFIRME } from './confirmations';

export type Langue = 'fr' | 'en';

export interface EtagesConfig {
  id: string;
  code: string;
  labelFr: string;
  labelEn: string;
}

export const ETAGES_NAVIGATION: EtagesConfig[] = [
  { id: 'etage-rdc', code: 'RDC', labelFr: 'Rue Njo-Njo', labelEn: 'Njo-Njo St.' },
  { id: 'etage-cocktails', code: '01', labelFr: 'Bar & Cocktails', labelEn: 'Bar & Cocktails' },
  { id: 'etage-cuisine', code: '02', labelFr: 'Cuisine & Grill', labelEn: 'Kitchen & Grill' },
  { id: 'etage-cave', code: '03', labelFr: 'La Cave', labelEn: 'Cellar & Spirits' },
  { id: 'etage-soirees', code: '04', labelFr: 'Soirées & Salon', labelEn: 'Evenings & Private' },
  { id: 'etage-toit', code: 'TOIT', labelFr: 'Réserver & Accès', labelEn: 'Booking & Info' },
];

export const TEXTES_SITE = {
  fr: {
    skipLink: 'Aller au contenu principal',
    nav: {
      bar: 'Bar',
      cuisine: 'Cuisine',
      cave: 'Cave',
      soirees: 'Soirées',
      reserver: 'Réserver',
      panier: 'Panier',
    },
    rdc: {
      surTitre: 'Rez-de-chaussée · 1163, rue Njo-Njo · Bonapriso',
      titre: 'One Rooftop',
      sousTitre: CONFIRME.auDessusDeBombayMasala
        ? 'Bar à cocktails, restaurant et terrasse au-dessus de Bombay Masala.'
        : 'Bar à cocktails, restaurant et rooftop à Bonapriso, Douala.',
      intro: CONFIRME.salleClimatisee
        ? 'Ouvert depuis décembre 2020 à Bonapriso, One Rooftop réunit une salle intérieure climatisée et une terrasse autour d’une carte intercontinentale, de grillades au charbon de bois, de sushis et d’une cave de Bordeaux et spiritueux.'
        : 'Ouvert depuis décembre 2020 à Bonapriso : bar à cocktails, cuisine intercontinentale, grillades au charbon de bois, sushis et cave de Bordeaux et spiritueux.',
      ctaReserver: 'Réserver une table',
      ctaCarte: 'Monter à la carte',
      monterIndice: 'Monter',
      photoSlotTitre: 'Architecture · 1163 rue Njo-Njo',
      photoSlotSousTitre: 'Bonapriso, Douala',
    },
    carte: {
      recherchePlaceholder: 'Rechercher un plat, un vin, un cocktail…',
      effacerRecherche: 'Effacer',
      imprimer: 'Imprimer la carte',
      aucunResultat: 'Aucune référence ne correspond à votre recherche sur cet étage.',
      tousFiltres: 'Toute la carte',
      filtreV: 'Végétarien (V)',
      filtreLC: 'Faible en calories (LC)',
      ajouter: 'Ajouter',
      ajouteConfirmation: 'Ajouté',
      choisir: 'Options',
      verre: 'Verre',
      bouteille: 'Bouteille',
      optionRequise: 'Choix obligatoire',
      optionsFacultatives: 'En option',
      remarqueRequise: 'Précision obligatoire',
      remarqueLabel: 'Précision pour la cuisine ou le bar',
      remarquePlaceholder: 'Cuisson souhaitée, sans glace, précision…',
      quantite: 'Quantité',
      photoAttenteTitre: 'One Rooftop · Bonapriso',
      photoAttenteDesc: 'Illustration architecturale de la table et du bar.',
      photoApprochante:
        'Photo d’illustration approchante : elle ne représente pas exactement ce plat.',
      fermer: 'Fermer',
    },
    soirees: {
      surTitre: 'Étage 04 · Soirées & Salons',
      titre: 'Soirées & Réceptions',
      intro:
        CONFIRME.musiqueLive && CONFIRME.dj
          ? 'Dîner accompagné de musique live en début de soirée, puis programmation DJ.'
          : CONFIRME.musiqueLive
            ? 'Dîner accompagné de musique live en soirée.'
            : CONFIRME.dj
              ? 'Programmation DJ en soirée.'
              : 'Espace du soir à Bonapriso.',
      blocJacarandaTitre: 'Le bar central et le jacaranda lumineux',
      blocJacarandaTexte:
        'Installé au centre du bar, le jacaranda lumineux structure l’espace du soir.',
      blocPrivatisationTitre: 'Réceptions sur demande',
      blocPrivatisationTexte:
        CONFIRME.traiteur && CONFIRME.privatisation
          ? 'Salle privée, privatisation d’espace et service traiteur sur demande.'
          : CONFIRME.privatisation
            ? 'Privatisation d’espace pour vos célébrations sur demande.'
            : 'Service traiteur disponible sur demande.',
      ctaPrivatiser: CONFIRME.privatisation
        ? 'Demander une réservation ou privatisation'
        : 'Demander une réservation',
      photoTerrasse: 'Terrasse et bar en soirée',
      photoSalle: 'Espace de réception',
    },
    toit: {
      surTitre: 'Sommet · Toit de Bonapriso',
      titre: 'Réservation & Informations',
      horairesTitre: 'Horaires d’ouverture (Douala)',
      accesTitre: 'Adresse et accès',
      servicesTitre: 'Services sur place',
      voirCarteMaps: 'Ouvrir l’itinéraire sur Google Maps',
      appeler: 'Appeler le',
    },
    reservation: {
      titre: 'Demander une table',
      sousTitre: 'La table n’est réservée qu’après confirmation du restaurant.',
      date: 'Date',
      heure: 'Heure d’arrivée',
      heureLibreLabel: 'Heure souhaitée (confirmation par le restaurant)',
      heureInvalide: 'Indiquez une heure valide au format HH:MM.',
      aucunCreneau: 'Aucun créneau disponible ce jour-là (fermeture ou service terminé).',
      personnes: 'Nombre de personnes',
      plusDe12:
        'Au-delà de 12 personnes, merci de contacter directement le restaurant par téléphone au +237 671 03 33 33.',
      nom: 'Nom complet',
      telephone: 'Téléphone',
      remarque: CONFIRME.salleClimatisee
        ? 'Précision (terrasse, salle climatisée, anniversaire…)'
        : 'Précision (anniversaire, allergie, placement…)',
      preparer: 'Préparer la demande',
      messagePret: 'Votre demande est prête à être envoyée.',
      whatsappDesactive:
        'L’envoi direct par WhatsApp n’est pas activé pour le moment. Copiez votre demande ci-dessous et appelez le restaurant.',
      tropLong:
        'Le message dépasse 1 800 caractères pour un lien direct. Utilisez le bouton « Copier le message » ci-dessous.',
      copier: 'Copier le message',
      copieFait: 'Message copié',
      ouvrirWhatsapp: 'Ouvrir WhatsApp',
      appeler: 'Appeler',
    },
    panier: {
      titre: 'Votre sélection',
      vide: 'Votre panier est vide. Sélectionnez des plats ou boissons dans les étages de la carte.',
      modeRetrait: 'Mode de retrait',
      emporter: 'À emporter',
      livraison: 'Livraison',
      infoLivraison:
        'Le restaurant confirme par WhatsApp ou par téléphone s’il peut livrer à votre adresse, et les frais éventuels.',
      adresseLabel: 'Adresse à Douala',
      adressePlaceholder: 'Quartier, rue, repère…',
      nomLabel: 'Votre nom',
      telLabel: 'Téléphone',
      remarqueLabel: 'Précision générale',
      totalPlats: 'Total des plats',
      preparerCommande: 'Préparer la commande',
      commandePrete: 'Votre commande est prête à être envoyée.',
      mentionValidation:
        'Cette commande n’est prise en compte qu’après la réponse du restaurant.',
      vider: 'Vider le panier',
      retirer: 'Retirer',
    },
    confidentialite: {
      titre: 'Confidentialité & Fonctionnement du site',
      points: [
        'Aucune donnée personnelle (nom, téléphone, adresse) n’est enregistrée dans votre navigateur ni transmise à un serveur tiers.',
        'Lorsqu’un panier est actif, son contenu (identifiants des plats, quantités, options et remarques) est conservé localement dans votre navigateur pendant 24 heures.',
        'Le site n’utilise ni cookies publicitaires, ni traceurs statistiques, ni polices hébergées sur des serveurs externes.',
        'Lorsque vous préparez une demande de table ou une commande, le message est formaté localement afin que vous puissiez le transmettre directement au restaurant.',
      ],
    },
    footer: {
      mention: 'One Rooftop Bar & Lounge · 1163, rue Njo-Njo, Bonapriso, Douala',
      confidentialite: 'Confidentialité',
    },
  },
  en: {
    skipLink: 'Skip to main content',
    nav: {
      bar: 'Bar',
      cuisine: 'Kitchen',
      cave: 'Cellar',
      soirees: 'Evenings',
      reserver: 'Book',
      panier: 'Order',
    },
    rdc: {
      surTitre: 'Ground Floor · 1163 Rue Njo-Njo · Bonapriso',
      titre: 'One Rooftop',
      sousTitre: CONFIRME.auDessusDeBombayMasala
        ? 'Cocktail bar, restaurant and rooftop terrace above Bombay Masala.'
        : 'Cocktail bar, restaurant and rooftop in Bonapriso, Douala.',
      intro: CONFIRME.salleClimatisee
        ? 'Open since December 2020 in Bonapriso, One Rooftop brings together an air-conditioned dining room and a terrace with an intercontinental menu, charcoal grill, sushi and a cellar of Bordeaux wines and spirits.'
        : 'Open since December 2020 in Bonapriso: cocktail bar, intercontinental kitchen, charcoal grill, sushi, and a cellar of Bordeaux wines and spirits.',
      ctaReserver: 'Request a table',
      ctaCarte: 'Explore the menu',
      monterIndice: 'Ascend',
      photoSlotTitre: 'Architecture · 1163 Rue Njo-Njo',
      photoSlotSousTitre: 'Bonapriso, Douala',
    },
    carte: {
      recherchePlaceholder: 'Search a dish, wine, or cocktail…',
      effacerRecherche: 'Clear',
      imprimer: 'Print menu',
      aucunResultat: 'No item matches your search on this floor.',
      tousFiltres: 'Full floor menu',
      filtreV: 'Vegetarian (V)',
      filtreLC: 'Low Calorie (LC)',
      ajouter: 'Add',
      ajouteConfirmation: 'Added',
      choisir: 'Options',
      verre: 'Glass',
      bouteille: 'Bottle',
      optionRequise: 'Required choice',
      optionsFacultatives: 'Optional',
      remarqueRequise: 'Required note',
      remarqueLabel: 'Note for kitchen or bar',
      remarquePlaceholder: 'Cooking preference, ice preference…',
      quantite: 'Quantity',
      photoAttenteTitre: 'One Rooftop · Bonapriso',
      photoAttenteDesc: 'Architectural study of the table and bar.',
      photoApprochante:
        'Approximate illustration photo: it does not represent this exact dish.',
      fermer: 'Close',
    },
    soirees: {
      surTitre: 'Floor 04 · Evenings & Salons',
      titre: 'Evenings & Gatherings',
      intro:
        CONFIRME.musiqueLive && CONFIRME.dj
          ? 'Evening dinner with live music followed by DJ programming.'
          : CONFIRME.musiqueLive
            ? 'Evening dinner with live music.'
            : CONFIRME.dj
              ? 'Evening DJ programming.'
              : 'Evening lounge in Bonapriso.',
      blocJacarandaTitre: 'The central bar and illuminated jacaranda',
      blocJacarandaTexte:
        'Set at the center of the bar, the illuminated jacaranda anchors the evening space.',
      blocPrivatisationTitre: 'Gatherings on request',
      blocPrivatisationTexte:
        CONFIRME.traiteur && CONFIRME.privatisation
          ? 'Private space buyouts and catering services available on request.'
          : CONFIRME.privatisation
            ? 'Space buyouts for celebrations available on request.'
            : 'Catering services available on request.',
      ctaPrivatiser: CONFIRME.privatisation
        ? 'Request a booking or private event'
        : 'Request a booking',
      photoTerrasse: 'Rooftop terrace and central bar',
      photoSalle: 'Evening space',
    },
    toit: {
      surTitre: 'Rooftop · Above Bonapriso',
      titre: 'Reservations & Information',
      horairesTitre: 'Opening Hours (Douala)',
      accesTitre: 'Address & Directions',
      servicesTitre: 'Available Services',
      voirCarteMaps: 'Open directions in Google Maps',
      appeler: 'Call',
    },
    reservation: {
      titre: 'Request a table',
      sousTitre: 'Your table is confirmed only after the restaurant replies.',
      date: 'Date',
      heure: 'Arrival time',
      heureLibreLabel: 'Preferred time (confirmed by the restaurant)',
      heureInvalide: 'Enter a valid time in HH:MM format.',
      aucunCreneau: 'No slots available on this date.',
      personnes: 'Party size',
      plusDe12:
        'For groups over 12 guests, please call the restaurant directly at +237 671 03 33 33.',
      nom: 'Full name',
      telephone: 'Phone',
      remarque: CONFIRME.salleClimatisee
        ? 'Preference (terrace, indoor room, celebration…)'
        : 'Preference (celebration, allergy, seating…)',
      preparer: 'Prepare request',
      messagePret: 'Your request is ready to send.',
      whatsappDesactive:
        'Direct WhatsApp sending is not yet enabled. Copy your message below and call the restaurant directly.',
      tropLong:
        'Message exceeds 1,800 characters for a direct link. Please use Copy message below.',
      copier: 'Copy message',
      copieFait: 'Copied',
      ouvrirWhatsapp: 'Open WhatsApp',
      appeler: 'Call',
    },
    panier: {
      titre: 'Your selection',
      vide: 'Your selection is empty. Add dishes or drinks from the menu floors.',
      modeRetrait: 'Order type',
      emporter: 'Takeaway',
      livraison: 'Delivery',
      infoLivraison:
        'The restaurant will confirm via WhatsApp or phone whether delivery is available to your address and any applicable fee.',
      adresseLabel: 'Delivery address in Douala',
      adressePlaceholder: 'Neighborhood, street, landmark…',
      nomLabel: 'Your name',
      telLabel: 'Phone',
      remarqueLabel: 'General note',
      totalPlats: 'Items subtotal',
      preparerCommande: 'Prepare order',
      commandePrete: 'Your order is ready to send.',
      mentionValidation: 'This order is confirmed only after the restaurant replies.',
      vider: 'Clear selection',
      retirer: 'Remove',
    },
    confidentialite: {
      titre: 'Privacy & Site Policy',
      points: [
        'No personal data (name, phone number, address) is stored in your browser or sent to any third-party server.',
        'When an order cart is active, only your selection (item IDs, quantities, options, notes) is stored locally in your browser for 24 hours.',
        'This site uses no advertising cookies, analytics trackers, or external font servers.',
        'Messages for table requests or orders are formatted locally so you can send them directly to the restaurant.',
      ],
    },
    footer: {
      mention: 'One Rooftop Bar & Lounge · 1163 Rue Njo-Njo, Bonapriso, Douala',
      confidentialite: 'Privacy',
    },
  },
} as const;
