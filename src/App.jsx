import { Login } from './pages';
import { Toaster } from 'react-hot-toast';
import  useNotifications  from './hooks/useNotifications';

function App() {
  const userId = '6867a2b3c8c9743357bfe8c5';

  useNotifications(userId);
  return (
    <>
    <Toaster position={window.innerWidth < 768 ? 'top-center' : 'top-right'}/>
    home
    </>
  );
}

export default App;
