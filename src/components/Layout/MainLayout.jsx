import Header from '../Header';
import AutoNotificationPermission from '../AutoNotificationPermission';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <AutoNotificationPermission />
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
