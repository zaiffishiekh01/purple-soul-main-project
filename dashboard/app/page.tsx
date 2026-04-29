import { PublicRoute } from '@/src/components/PublicRoute';
import { RoleSelection } from '@/src/components/RoleSelection';

export default function HomePage() {
  return (
    <PublicRoute>
      <RoleSelection />
    </PublicRoute>
  );
}
