import platPhotosJson from '../data/platPhotos.json';
import { clePhotoPlat } from './panier';

export interface PlatPhotoEntry {
  src: string;
  width: number;
  height: number;
  alt?: string;
  auteur?: string;
  licence?: string;
  sourceUrl?: string;
  approchante?: boolean;
}

const REGISTRE_PHOTOS = (platPhotosJson as { plats?: Record<string, PlatPhotoEntry> }).plats ?? {};

export function obtenirPhotoPlat(categorie: string, nom: string): PlatPhotoEntry | null {
  const cle = clePhotoPlat(categorie, nom);
  const entree = REGISTRE_PHOTOS[cle];
  if (!entree || typeof entree.src !== 'string' || !entree.src.startsWith('/')) {
    return null;
  }
  return entree;
}
