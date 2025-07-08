import Header from '../Header';

const MainLayout = ({ children, unreadCount = 0 }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header unreadCount={unreadCount} />
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
