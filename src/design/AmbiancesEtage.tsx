import { useEffect, useState } from 'react';
import { CONFIRME } from '../data/confirmations';
import { useActiveWhenVisible } from './motion/useActiveWhenVisible';

export type SceneAmbianceType = 'bar' | 'cuisine' | 'cave' | 'soirees' | 'sommet';

interface PhotoManifestEntry {
  fichier: string;
  legende?: string;
  credit?: string;
  emplacement?: string;
}

let cacheManifest: PhotoManifestEntry[] | null = null;
let promesseManifest: Promise<PhotoManifestEntry[]> | null = null;

function chargerManifestPhotosLieu(): Promise<PhotoManifestEntry[]> {
  if (cacheManifest !== null) return Promise.resolve(cacheManifest);
  if (promesseManifest) return promesseManifest;

  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    cacheManifest = [];
    return Promise.resolve([]);
  }

  promesseManifest = fetch('/photos/lieu/manifest.json', { cache: 'no-cache' })
    .then(async (res) => {
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.filter(
        (item): item is PhotoManifestEntry =>
          Boolean(item && typeof item.fichier === 'string' && !item.fichier.includes('..')),
      );
    })
    .catch(() => [])
    .then((liste) => {
      cacheManifest = liste;
      return liste;
    });

  return promesseManifest;
}

const BRAISES = [
  { cx: 36, cy: 86, r: 1.8 },
  { cx: 64, cy: 78, r: 1.4 },
  { cx: 92, cy: 90, r: 2.1 },
  { cx: 120, cy: 76, r: 1.5 },
  { cx: 148, cy: 84, r: 1.9 },
  { cx: 176, cy: 80, r: 1.4 },
  { cx: 204, cy: 88, r: 2.0 },
  { cx: 232, cy: 77, r: 1.6 },
  { cx: 260, cy: 85, r: 1.7 },
  { cx: 288, cy: 79, r: 1.4 },
  { cx: 312, cy: 86, r: 1.8 },
  { cx: 336, cy: 82, r: 1.5 },
];

const BULLES = [
  { cx: 132, cy: 96, r: 1.7 },
  { cx: 148, cy: 88, r: 1.3 },
  { cx: 162, cy: 98, r: 2.0 },
  { cx: 174, cy: 82, r: 1.4 },
  { cx: 186, cy: 95, r: 1.8 },
  { cx: 198, cy: 86, r: 1.2 },
  { cx: 210, cy: 94, r: 2.1 },
  { cx: 222, cy: 84, r: 1.5 },
  { cx: 234, cy: 97, r: 1.6 },
  { cx: 142, cy: 74, r: 1.3 },
  { cx: 168, cy: 68, r: 1.5 },
  { cx: 192, cy: 72, r: 1.4 },
  { cx: 216, cy: 70, r: 1.6 },
  { cx: 228, cy: 76, r: 1.2 },
];

const FENETRES_SKYLINE = [
  { x: 34, y: 58 }, { x: 48, y: 58 }, { x: 34, y: 74 },
  { x: 86, y: 42 }, { x: 100, y: 42 }, { x: 86, y: 58 }, { x: 100, y: 74 },
  { x: 146, y: 34 }, { x: 160, y: 34 }, { x: 146, y: 50 }, { x: 160, y: 66 },
  { x: 204, y: 48 }, { x: 218, y: 48 }, { x: 204, y: 64 },
  { x: 256, y: 30 }, { x: 272, y: 30 }, { x: 256, y: 46 }, { x: 272, y: 62 },
  { x: 314, y: 52 }, { x: 328, y: 68 },
];

const ETOILES_SKYLINE = [
  { cx: 20, cy: 14 }, { cx: 46, cy: 20 }, { cx: 68, cy: 10 }, { cx: 92, cy: 18 },
  { cx: 118, cy: 12 }, { cx: 138, cy: 22 }, { cx: 166, cy: 10 }, { cx: 188, cy: 16 },
  { cx: 212, cy: 11 }, { cx: 236, cy: 20 }, { cx: 262, cy: 12 }, { cx: 288, cy: 18 },
  { cx: 312, cy: 10 }, { cx: 340, cy: 22 }, { cx: 358, cy: 13 }, { cx: 58, cy: 30 },
  { cx: 126, cy: 28 }, { cx: 196, cy: 26 }, { cx: 244, cy: 28 }, { cx: 302, cy: 26 },
  { cx: 28, cy: 28 }, { cx: 178, cy: 8 }, { cx: 278, cy: 8 }, { cx: 348, cy: 30 },
];

export function SceneDessinee({
  scene,
  impulsion = 0,
}: {
  scene: SceneAmbianceType;
  impulsion?: number;
}) {
  const { ref, actif } = useActiveWhenVisible();

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-hidden ${actif ? '' : 'est-en-pause'}`}
    >
      {scene === 'bar' && (
        <svg viewBox="0 0 360 112" className="w-full h-24 sm:h-28" fill="none">
          <line x1="16" y1="96" x2="344" y2="96" stroke="#96650B" strokeWidth="1" />
          <line x1="180" y1="20" x2="180" y2="96" stroke="#96650B" strokeWidth="1" />
          <polygon points="154,28 206,28 180,58" stroke="#CA8C3A" strokeWidth="1.2" />
          <circle key={impulsion} cx="180" cy="56" r="18" stroke="#CA8C3A" strokeWidth="1" className="scene-onde" />
          <circle cx="180" cy="56" r="30" stroke="#96650B" strokeWidth="1" className="scene-onde delai-2" />
          <circle cx="180" cy="56" r="44" stroke="#96650B" strokeWidth="0.8" className="scene-onde delai-4" />
        </svg>
      )}

      {scene === 'cuisine' && (
        <svg viewBox="0 0 360 112" className="w-full h-24 sm:h-28" fill="none">
          <line x1="20" y1="92" x2="340" y2="92" stroke="#CA8C3A" strokeWidth="1.2" />
          <line x1="20" y1="98" x2="340" y2="98" stroke="#96650B" strokeWidth="1" />
          <g className="grille-delais">
            {BRAISES.map((b, i) => (
              <circle
                key={i}
                cx={b.cx}
                cy={b.cy}
                r={b.r}
                fill="#CA8C3A"
                className="scene-braise"
              />
            ))}
          </g>
        </svg>
      )}

      {scene === 'cave' && (
        <svg viewBox="0 0 360 112" className="w-full h-24 sm:h-28" fill="none">
          <line x1="24" y1="100" x2="336" y2="100" stroke="#96650B" strokeWidth="1" />
          <rect x="122" y="14" width="116" height="86" stroke="#96650B" strokeWidth="1" />
          <line x1="180" y1="14" x2="180" y2="100" stroke="#96650B" strokeWidth="0.8" />
          <g className="grille-delais">
            {BULLES.map((b, i) => (
              <circle
                key={i}
                cx={b.cx}
                cy={b.cy}
                r={b.r}
                stroke="#CA8C3A"
                strokeWidth="1"
                className="scene-bulle"
              />
            ))}
          </g>
        </svg>
      )}

      {scene === 'soirees' && (
        <svg viewBox="0 0 360 112" className="w-full h-24 sm:h-28" fill="none">
          <rect x="16" y="12" width="328" height="88" stroke="#96650B" strokeWidth="1" />
          <polygon points="90,12 50,100 130,100" fill="rgba(202,140,58,0.08)" className="scene-faisceau" />
          <polygon points="180,12 140,100 220,100" fill="rgba(202,140,58,0.08)" className="scene-faisceau delai-2" />
          <polygon points="270,12 230,100 310,100" fill="rgba(202,140,58,0.08)" className="scene-faisceau delai-4" />
          {CONFIRME.musiqueLive && (
            <g className="grille-delais">
              <rect x="152" y="60" width="6" height="32" fill="#CA8C3A" className="scene-egaliseur" />
              <rect x="164" y="52" width="6" height="40" fill="#CA8C3A" className="scene-egaliseur" />
              <rect x="176" y="46" width="6" height="46" fill="#CA8C3A" className="scene-egaliseur" />
              <rect x="188" y="56" width="6" height="36" fill="#CA8C3A" className="scene-egaliseur" />
              <rect x="200" y="64" width="6" height="28" fill="#CA8C3A" className="scene-egaliseur" />
            </g>
          )}
        </svg>
      )}

      {scene === 'sommet' && (
        <svg viewBox="0 0 372 112" className="w-full h-24 sm:h-28" fill="none">
          <g className="grille-delais">
            {ETOILES_SKYLINE.map((s, i) => (
              <circle
                key={`e-${i}`}
                cx={s.cx}
                cy={s.cy}
                r="0.9"
                fill="#F3E9D8"
                className="scene-scintille"
              />
            ))}
          </g>
          <rect x="24" y="48" width="46" height="58" stroke="#96650B" strokeWidth="1" />
          <rect x="76" y="34" width="52" height="72" stroke="#96650B" strokeWidth="1" />
          <rect x="136" y="24" width="50" height="82" stroke="#CA8C3A" strokeWidth="1.2" />
          <rect x="194" y="40" width="46" height="66" stroke="#96650B" strokeWidth="1" />
          <rect x="246" y="20" width="52" height="86" stroke="#CA8C3A" strokeWidth="1" />
          <rect x="304" y="44" width="46" height="62" stroke="#96650B" strokeWidth="1" />
          <g className="grille-delais">
            {FENETRES_SKYLINE.map((f, i) => (
              <rect
                key={`f-${i}`}
                x={f.x}
                y={f.y}
                width="8"
                height="8"
                fill="#CA8C3A"
                className="scene-scintille"
              />
            ))}
          </g>
          <line x1="12" y1="106" x2="360" y2="106" stroke="#96650B" strokeWidth="1" />
        </svg>
      )}
    </div>
  );
}

/**
 * Cadre photo du lieu : affiche public/photos/lieu/manifest.json (si présent)
 * avec zoom lent 1 -> 1.06 sur 14s et fondu enchaîné, sinon la scène dessinée.
 */
export function CadrePhotoLieu({
  emplacement,
  sceneRepli,
  titre,
  sousTitre,
}: {
  emplacement: string;
  sceneRepli: SceneAmbianceType;
  titre: string;
  sousTitre?: string;
}) {
  const { ref, actif } = useActiveWhenVisible();
  const [photos, setPhotos] = useState<PhotoManifestEntry[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let annule = false;
    chargerManifestPhotosLieu().then((toutes) => {
      if (annule || toutes.length === 0) return;
      const filtrees = toutes.filter(
        (p) => !p.emplacement || p.emplacement === emplacement,
      );
      setPhotos(filtrees.length > 0 ? filtrees : toutes);
    });
    return () => {
      annule = true;
    };
  }, [emplacement]);

  useEffect(() => {
    if (photos.length <= 1 || !actif) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [photos.length, actif]);

  const photoCourante = photos[index];

  return (
    <div
      ref={ref}
      className={`border border-bronze bg-nuit overflow-hidden ${actif ? '' : 'est-en-pause'}`}
    >
      {photoCourante ? (
        <figure className="relative aspect-[16/9] overflow-hidden bg-nuit">
          <img
            key={photoCourante.fichier}
            src={`/photos/lieu/${photoCourante.fichier}`}
            alt={photoCourante.legende ?? titre}
            loading="lazy"
            className="w-full h-full object-cover photo-lieu-zoom"
          />
          {(photoCourante.legende || photoCourante.credit) && (
            <figcaption className="absolute inset-x-0 bottom-0 bg-nuit/85 border-t border-bronze px-3 py-2 text-xs text-ivoire-doux flex items-center justify-between gap-2">
              <span className="font-editorial italic text-sm text-ivoire">
                {photoCourante.legende ?? titre}
              </span>
              {photoCourante.credit && (
                <span className="font-display uppercase tracking-[0.1em] text-[10px] text-or">
                  {photoCourante.credit}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="p-4 flex flex-col justify-between gap-3">
          <SceneDessinee scene={sceneRepli} />
          <div className="border-t border-bronze pt-2.5 flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-xs uppercase tracking-[0.16em] text-or">
              {titre}
            </p>
            {sousTitre && (
              <p className="font-editorial italic text-base text-ivoire-doux">
                {sousTitre}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
