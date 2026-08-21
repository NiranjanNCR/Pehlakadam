import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Pehlakadam Uncaught UI Error]:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-zinc-800/90 border border-zinc-700 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black">
              PK
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Pehlakadam Application</h2>
            <p className="text-sm text-zinc-400 mb-6">
              A temporary interface refresh is needed to load the latest platform assets.
            </p>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

