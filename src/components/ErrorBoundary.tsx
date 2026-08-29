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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleClearSessionAndRetry = () => {
    try {
      localStorage.removeItem("pehlakadam_student_phone");
      localStorage.removeItem("pehlakadam_student_session_id");
      localStorage.removeItem("pehlakadam_premium_phone");
      localStorage.removeItem("pehlakadam_premium_session_id");
      localStorage.removeItem("pehlakadam_user");
    } catch (e) {}
    window.location.href = "/dashboard";
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div id="pehlakadam-error-boundary-view" className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              PK
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Portal Recovery Assistant</h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                An unexpected interface display condition occurred. Your account data and progress remain safe.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                id="error-boundary-refresh-btn"
                onClick={this.handleReset}
                className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all cursor-pointer"
              >
                Refresh View
              </button>

              <button
                id="error-boundary-dashboard-retry-btn"
                onClick={this.handleClearSessionAndRetry}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer"
              >
                Re-authenticate & Open Dashboard
              </button>

              <button
                id="error-boundary-home-btn"
                onClick={this.handleGoHome}
                className="w-full py-2 px-4 text-zinc-500 hover:text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
              >
                Return to Home Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

