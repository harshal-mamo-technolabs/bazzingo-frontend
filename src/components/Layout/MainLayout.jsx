import Header from '../Header';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
