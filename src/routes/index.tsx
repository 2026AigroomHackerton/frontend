import PersonalPage from '../pages/PersonalPage';
import SharedPage from '../pages/SharedPage';

export const appRoutes = [
  {
    path: '/personal',
    label: '개인 문서',
    element: <PersonalPage />,
  },
  {
    path: '/shared',
    label: '공유 문서',
    element: <SharedPage />,
  },
] as const;

export function findRouteByPath(pathname: string) {
  return appRoutes.find((route) => route.path === pathname);
}
