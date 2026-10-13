import React from 'react';
import ReactDOM from 'react-dom/client';
import TerminalApp from './terminal/TerminalApp';
class ErrorBoundary extends React.Component<{children:React.ReactNode},{error:string}> {
  state={error:''};
  static getDerivedStateFromError(error:Error){return {error:error.message};}
  render(){if(this.state.error)return <main className="terminal-shell"><h1>页面暂时无法打开</h1><p role="alert">{this.state.error}</p><button onClick={()=>location.reload()}>重新打开</button></main>;return this.props.children;}
}
ReactDOM.createRoot(document.getElementById('root')!).render(<ErrorBoundary><TerminalApp/></ErrorBoundary>);
