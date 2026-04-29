import UniversalRegistry from './UniversalRegistry';

interface WeddingRegistryProps {
  currentUserId?: string;
  viewMode?: 'create' | 'manage' | 'guest' | 'browse';
  registrySlug?: string;
}

export default function WeddingRegistry({
  currentUserId,
  viewMode = 'browse',
  registrySlug
}: WeddingRegistryProps) {
  return (
    <UniversalRegistry
      currentUserId={currentUserId}
      initialView={viewMode}
      registrySlug={registrySlug}
      defaultRegistryType="wedding"
      defaultFaithTradition="shared"
    />
  );
}
