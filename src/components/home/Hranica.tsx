/** Malá hranica chýb pre ostrovy domova: keď lazy chunk alebo efekt padne za behu, obsah ostane (fallback),
 *  namiesto toho, aby React 19 odmontoval celý ostrov (hero bez h1, sekcia bez kariet). */
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { fallback?: ReactNode; children: ReactNode };
type State = { chyba: boolean };

export default class Hranica extends Component<Props, State> {
  override state: State = { chyba: false };

  static getDerivedStateFromError(): State {
    return { chyba: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    if (import.meta.env.DEV) console.warn('[xvadur] ostrov spadol, ostáva fallback', error, info.componentStack);
  }

  override render(): ReactNode {
    return this.state.chyba ? (this.props.fallback ?? null) : this.props.children;
  }
}
