import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary yakaladı:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="m-4 bg-white border border-[#DEE2E6] rounded-2xl text-[#212529] shadow-xl overflow-hidden flex flex-col items-center justify-center text-center max-w-lg mx-auto font-poppins">
          <div className="gov-bar w-full h-[5px] shrink-0" />
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/20 flex items-center justify-center text-[#D32F2F] mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#212529] mb-1">
              {this.props.fallbackTitle || 'Görünüm Yüklenirken Bir Sorun Oluştu'}
            </h3>
            <p className="text-xs text-[#6C757D] mb-4 max-w-sm">
              Nokta verileri güvenli şekilde korunuyor. Görünümü sıfırlamak için aşağıdaki butona tıklayın.
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Görünümü Yenile</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
