import { PublicRoute } from '@/src/components/PublicRoute';
import { Auth } from '@/src/components/Auth';

export default function AuthRolePage() {
  return (
    <PublicRoute>
      <Auth />
    </PublicRoute>
  );
}
