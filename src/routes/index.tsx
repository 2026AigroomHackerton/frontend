import EditorPage from '../pages/EditorPage';
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
  {
    path: '/editor',
    label: '문서 편집',
    element: <EditorPage />,
  },
] as const;

export function findRouteByPath(pathname: string) {
  return appRoutes.find((route) => route.path === pathname);
}
