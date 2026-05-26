import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="workspace">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
