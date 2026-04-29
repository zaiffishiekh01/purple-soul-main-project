import { useState } from 'react';
import { ShippingManagement } from './ShippingManagement';
import { ShippingModal } from './modals/ShippingModal';
import { useShipments, Shipment } from '../hooks/useShipments';

export function ShippingManagementContainer() {
  const { shipments, loading, createShipment, updateShipment } = useShipments();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleCreateShipment = () => {
    setSelectedShipment(null);
    setShowModal(true);
  };

  const handleEditShipment = (shipmentId: string) => {
    const shipment = shipments.find((s) => s.id === shipmentId);
    if (shipment) {
      setSelectedShipment(shipment);
      setShowModal(true);
    }
  };

  const handleSaveShipment = async (shipmentData: Partial<Shipment>) => {
    if (selectedShipment) {
      await updateShipment(selectedShipment.id, shipmentData);
    } else {
      await createShipment(shipmentData as Omit<Shipment, 'id' | 'vendor_id' | 'created_at' | 'updated_at' | 'order_number' | 'customer_name'>);
    }
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sufi-purple"></div>
      </div>
    );
  }

  return (
    <>
      <ShippingManagement
        shipments={shipments}
        onCreateShipment={handleCreateShipment}
        onEditShipment={handleEditShipment}
      />
      {showModal && (
        <ShippingModal
          shipment={selectedShipment}
          onClose={() => setShowModal(false)}
          onSave={handleSaveShipment}
        />
      )}
    </>
  );
}
