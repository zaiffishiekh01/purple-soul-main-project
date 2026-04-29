import { useState } from 'react';
import { ReturnManagement } from './ReturnManagement';
import { ReturnActionModal } from './modals/ReturnActionModal';
import { useReturns, Return } from '../hooks/useReturns';

type ActionType = 'approve' | 'reject' | 'receive' | 'refund';

export function ReturnManagementContainer() {
  const { returns, loading, approveReturn, rejectReturn, markReceived, processRefund } = useReturns();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    actionType: ActionType | null;
    returnData: Return | null;
  }>({
    isOpen: false,
    actionType: null,
    returnData: null,
  });

  const openModal = (actionType: ActionType, returnData: Return) => {
    setModalState({
      isOpen: true,
      actionType,
      returnData,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      actionType: null,
      returnData: null,
    });
  };

  const handleModalConfirm = async (data: any) => {
    setActionLoading(data.returnId);
    try {
      switch (data.status) {
        case 'approved':
          await approveReturn(data.returnId, data.notes);
          break;
        case 'rejected':
          await rejectReturn(data.returnId, data.rejection_reason, data.notes);
          break;
        case 'received':
          await markReceived(data.returnId, data.notes);
          break;
        case 'completed':
          await processRefund(data.returnId, {
            refund_method: data.refund_method,
            refund_amount: data.refund_amount,
            notes: data.notes,
          });
          break;
      }
    } catch (error: any) {
      console.error('Error processing return action:', error);
      const errorMessage = error?.message || 'Failed to process action. Please try again.';
      alert(`Error: ${errorMessage}`);
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (returnId: string) => {
    const returnData = returns.find((r) => r.id === returnId);
    if (returnData) {
      openModal('approve', returnData);
    }
  };

  const handleReject = async (returnId: string) => {
    const returnData = returns.find((r) => r.id === returnId);
    if (returnData) {
      openModal('reject', returnData);
    }
  };

  const handleMarkReceived = async (returnId: string) => {
    const returnData = returns.find((r) => r.id === returnId);
    if (returnData) {
      openModal('receive', returnData);
    }
  };

  const handleProcessRefund = async (returnId: string) => {
    const returnData = returns.find((r) => r.id === returnId);
    if (returnData) {
      openModal('refund', returnData);
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
      <ReturnManagement
        returns={returns}
        onApprove={handleApprove}
        onReject={handleReject}
        onMarkReceived={handleMarkReceived}
        onProcessRefund={handleProcessRefund}
        actionLoading={actionLoading}
      />

      {modalState.actionType && modalState.returnData && (
        <ReturnActionModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          returnData={modalState.returnData}
          actionType={modalState.actionType}
          onConfirm={handleModalConfirm}
          loading={actionLoading === modalState.returnData.id}
        />
      )}
    </>
  );
}
