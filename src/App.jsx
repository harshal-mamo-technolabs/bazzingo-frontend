import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkAndValidateToken } from './app/userSlice';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status: isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(checkAndValidateToken());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return null;
}

export default App;
