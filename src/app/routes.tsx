import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import GeneratorForm from '../components/generator/GeneratorForm';
import EpisodeList from '../components/episodes/EpisodeList';
import EpisodeDetail from '../components/episodes/EpisodeDetail';
import PersonaList from '../components/personas/PersonaList';
import PersonaBuilder from '../components/personas/PersonaBuilder';
import PublicFeed from '../components/feed/PublicFeed';
import ProfilePage from '../components/profile/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/register',
    element: <RegisterForm />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <GeneratorForm /> },
      { path: 'episodes', element: <EpisodeList /> },
      { path: 'episodes/:id', element: <EpisodeDetail /> },
      { path: 'personas', element: <PersonaList /> },
      { path: 'personas/new', element: <PersonaBuilder /> },
      { path: 'feed', element: <PublicFeed /> },
      { path: 'feed/:id', element: <EpisodeDetail /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
]);
