import { TEXTES_SITE, type Langue } from '../data/textesSite';
import { ModalFrame } from './ModalFrame';

export function ConfidentialiteModal({
  ouvert,
  langue,
  onFermer,
}: {
  ouvert: boolean;
  langue: Langue;
  onFermer: () => void;
}) {
  const t = TEXTES_SITE[langue].confidentialite;
  return (
    <ModalFrame
      ouvert={ouvert}
      onFermer={onFermer}
      titreId="modal-confidentialite-titre"
      titre={t.titre}
      labelFermer={TEXTES_SITE[langue].carte.fermer}
    >
      <ul className="space-y-4">
        {t.points.map((point, idx) => (
          <li
            key={idx}
            className="font-editorial italic text-lg text-ivoire-doux border-b border-bronze pb-3 last:border-b-0"
          >
            {point}
          </li>
        ))}
      </ul>
    </ModalFrame>
  );
}
