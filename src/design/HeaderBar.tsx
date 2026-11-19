import { ShoppingBag } from 'lucide-react';
import { AFFICHER_PANIER } from '../data/confirmations';
import { TEXTES_SITE, type Langue } from '../data/textesSite';

export function HeaderBar({
  langue,
  afficherSoirees,
  nombreArticles,
  animationPanier,
  onOuvrirPanier,
}: {
  langue: Langue;
  afficherSoirees: boolean;
  nombreArticles: number;
  animationPanier: boolean;
  onOuvrirPanier: () => void;
}) {
  const t = TEXTES_SITE[langue].nav;

  return (
    <header className="sticky top-0 z-40 bg-nuit border-b border-bronze no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1 : Marque seule */}
        <a
          href="#etage-rdc"
          className="focus-marque flex items-center gap-3 whitespace-nowrap shrink-0"
        >
          <img
            src="/assets/logo-rond.webp"
            alt="One Rooftop"
            width={30}
            height={30}
            className="w-[30px] h-[30px] object-contain shrink-0"
          />
          <span className="font-display text-sm sm:text-base uppercase tracking-[0.2em] text-ivoire font-medium">
            ONE ROOFTOP
          </span>
        </a>

        {/* Zone 2 : Liens d'étages concis */}
        <nav
          aria-label={langue === 'fr' ? 'Navigation des étages' : 'Floor navigation'}
          className="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.14em] text-ivoire-doux"
        >
          <a
            href="#etage-cocktails"
            className="focus-marque py-1 hover:text-ivoire hover:underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            {t.bar}
          </a>
          <a
            href="#etage-cuisine"
            className="focus-marque py-1 hover:text-ivoire hover:underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            {t.cuisine}
          </a>
          <a
            href="#etage-cave"
            className="focus-marque py-1 hover:text-ivoire hover:underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            {t.cave}
          </a>
          {afficherSoirees && (
            <a
              href="#etage-soirees"
              className="focus-marque py-1 hover:text-ivoire hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.soirees}
            </a>
          )}
          {AFFICHER_PANIER && (
            <a
              href="#etage-toit"
              className="focus-marque py-1 hover:text-ivoire hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.reserver}
            </a>
          )}
        </nav>

        {/* Zone 3 : Action primaire unique */}
        <div className="flex items-center shrink-0">
          {AFFICHER_PANIER ? (
            <button
              id="panier-bouton"
              type="button"
              onClick={onOuvrirPanier}
              className={`focus-marque bg-or text-nuit px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                animationPanier ? 'anim-panier' : ''
              }`}
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>{t.panier}</span>
              <span className="tabular-nums">({nombreArticles})</span>
            </button>
          ) : (
            <a
              href="#etage-toit"
              className="focus-marque bg-or text-nuit px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium inline-flex items-center whitespace-nowrap shrink-0 transition-colors"
            >
              {t.reserver}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
