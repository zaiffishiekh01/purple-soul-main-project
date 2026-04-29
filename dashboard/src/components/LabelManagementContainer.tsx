import { useState, useEffect } from 'react';
import { ShippingLabelManagement } from './ShippingLabelManagement';
import { CreateShippingLabelModal } from './modals/CreateShippingLabelModal';
import { PrintableLabel } from './PrintableLabel';
import { useShippingLabels, ShippingLabel } from '../hooks/useShippingLabels';

export function LabelManagementContainer() {
  const { labels, loading, createLabel, updateLabel, deleteLabel, generateAWB, generateTrackingNumber } = useShippingLabels();
  const [selectedLabel, setSelectedLabel] = useState<ShippingLabel | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [labelToPrint, setLabelToPrint] = useState<ShippingLabel | null>(null);
  const [prefilledOrderData, setPrefilledOrderData] = useState<any>(null);

  // Check for pre-filled order data on mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('labelOrderData');
    if (storedData) {
      try {
        const orderData = JSON.parse(storedData);
        setPrefilledOrderData(orderData);
        setShowModal(true);
        // Clear after reading
        sessionStorage.removeItem('labelOrderData');
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
  }, []);

  const handleCreateLabel = () => {
    setSelectedLabel(null);
    setPrefilledOrderData(null);
    setShowModal(true);
  };

  const handleEditLabel = (labelId: string) => {
    const label = labels.find((l) => l.id === labelId);
    if (label) {
      setSelectedLabel(label);
      setShowModal(true);
    }
  };

  const handleSaveLabel = async (labelData: Partial<ShippingLabel>) => {
    if (selectedLabel) {
      await updateLabel(selectedLabel.id, labelData);
    } else {
      await createLabel(labelData as Omit<ShippingLabel, 'id' | 'vendor_id' | 'created_at' | 'updated_at'>);
    }
    setShowModal(false);
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (confirm('Are you sure you want to delete this shipping label?')) {
      await deleteLabel(labelId);
    }
  };

  const handlePrintLabel = async (labelId: string) => {
    const label = labels.find((l) => l.id === labelId);
    if (label) {
      setLabelToPrint(label);
      await updateLabel(labelId, {
        status: 'printed',
        printed_at: new Date().toISOString(),
      });

      setTimeout(() => {
        window.print();
        setTimeout(() => setLabelToPrint(null), 1000);
      }, 100);
    }
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
      <ShippingLabelManagement
        labels={labels}
        onCreateLabel={handleCreateLabel}
        onEditLabel={handleEditLabel}
        onDeleteLabel={handleDeleteLabel}
        onPrintLabel={handlePrintLabel}
      />
      {showModal && (
        <CreateShippingLabelModal
          label={selectedLabel}
          orderData={prefilledOrderData}
          onClose={() => {
            setShowModal(false);
            setPrefilledOrderData(null);
          }}
          onSave={handleSaveLabel}
          generateAWB={generateAWB}
          generateTracking={generateTrackingNumber}
        />
      )}
      {labelToPrint && <PrintableLabel label={labelToPrint} />}
    </>
  );
}
