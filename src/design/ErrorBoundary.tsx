import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Phone } from 'lucide-react';
import { restaurantData } from '../data/restaurantData';

interface Props {
  children: ReactNode;
}

interface State {
  aErreur: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { aErreur: false };

  static getDerivedStateFromError(): State {
    return { aErreur: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Capture silencieuse côté interface sans exposer de trace technique
  }

  render() {
    if (this.state.aErreur) {
      const telLien = `tel:${restaurantData.lieux.telephone.replace(/\s+/g, '')}`;
      return (
        <main className="min-h-screen bg-nuit text-ivoire flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-bronze p-6 space-y-4">
            <h1 className="font-display text-base uppercase tracking-[0.14em] text-or">
              {restaurantData.restaurant.nom}
            </h1>
            <p className="font-editorial italic text-lg text-ivoire">
              Une interruption momentanée empêche l’affichage de la page. Vous pouvez joindre
              l’établissement directement par téléphone.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={telLien}
                className="focus-marque bg-or text-nuit px-4 py-2.5 text-xs uppercase tracking-[0.14em] font-medium inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>Appeler le {restaurantData.lieux.telephone}</span>
              </a>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="focus-marque border border-bronze text-ivoire px-4 py-2.5 text-xs uppercase tracking-[0.14em] cursor-pointer"
              >
                Recharger la page
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
