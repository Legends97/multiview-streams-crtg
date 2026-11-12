"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Darstellung im Fehlerfall; erhält die Fehlermeldung. */
  fallback: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

/**
 * Lokale Error-Boundary.
 *
 * Jedes Stream-Tile ist einzeln umschlossen, damit eine defekte
 * Player-Instanz nie das gesamte Grid beendet
 * (docs/08-multistream-player.md, Abschnitt 6).
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error("Fehler in abgegrenzter Komponente:", error);
  }

  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;

    if (error) return this.props.fallback(error, this.reset);

    return this.props.children;
  }
}
