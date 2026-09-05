import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    // The UI deliberately avoids rendering exception details or server data.
  }

  private reset = () => {
    this.props.onReset?.();
    this.setState({ failed: false });
  };

  render() {
    if (this.state.failed) {
      return (
        <main className="fatal-state" role="alert">
          <p className="eyebrow">界面发生意外错误</p>
          <h1>控制台已中断</h1>
          <p>当前页面无法渲染，请重新加载。</p>
          <button type="button" className="primary-button" onClick={this.reset}>重新加载控制台</button>
        </main>
      );
    }
    return this.props.children;
  }
}
