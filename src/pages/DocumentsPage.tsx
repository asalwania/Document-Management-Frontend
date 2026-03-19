import { useState, useEffect, useCallback } from 'react';
import { Typography } from '@mui/material';
import type { Document } from '../types/document';
import { useDocuments } from '../hooks/useDocuments';
import DocumentList from '../components/DocumentList/DocumentList';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Notification from '../components/common/ErrorAlert';
import CreateDocumentDialog from '../components/DocumentForm/CreateDocumentDialog';
import UpdateDocumentDialog from '../components/DocumentForm/UpdateDocumentDialog';
import LineItemDialog from '../components/DocumentForm/LineItemDialog';

export default function DocumentsPage() {
  const {
    documents,
    totalCount,
    loading,
    error,
    search,
    documentType,
    setSearch,
    setDocumentType,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    addLineItems,
    removeLineItems,
    pagination,
  } = useDocuments();

  const [createOpen, setCreateOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  const [addItemsDoc, setAddItemsDoc] = useState<Document | null>(null);
  const [removeItemsDoc, setRemoveItemsDoc] = useState<Document | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (error) {
      setNotification({ message: error, severity: 'error' });
    }
  }, [error]);

  const handleDelete = useCallback(
    async (forceDelete: boolean) => {
      if (!deleteDoc) return;
      try {
        await deleteDocument(deleteDoc.reference, forceDelete);
        setNotification({
          message: `"${deleteDoc.reference}" deleted successfully`,
          severity: 'success',
        });
      } catch {
        // error is set in hook via useEffect above
      }
      setDeleteDoc(null);
    },
    [deleteDoc, deleteDocument],
  );

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Documents
      </Typography>

      <DocumentList
        documents={documents}
        loading={loading}
        error={null}
        search={search}
        documentType={documentType}
        totalCount={totalCount}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        onSearchChange={setSearch}
        onDocumentTypeChange={setDocumentType}
        onCreateClick={() => setCreateOpen(true)}
        onEdit={setEditDoc}
        onDelete={setDeleteDoc}
        onAddItems={setAddItemsDoc}
        onRemoveItems={setRemoveItemsDoc}
        onPageChange={pagination.goToPage}
        onPageSizeChange={(size) => {
          pagination.setPageSize(size);
          pagination.resetPage();
        }}
        onErrorClose={() => {}}
      />

      <CreateDocumentDialog
        open={createOpen}
        onSave={async (payload) => {
          await createDocument(payload);
          setCreateOpen(false);
          setNotification({
            message: `"${payload.reference}" created successfully`,
            severity: 'success',
          });
        }}
        onCancel={() => setCreateOpen(false)}
      />

      <UpdateDocumentDialog
        open={!!editDoc}
        document={editDoc}
        onSave={async (payload) => {
          if (!editDoc) return;
          await updateDocument(editDoc.reference, payload);
          setEditDoc(null);
          setNotification({
            message: `"${editDoc.reference}" updated successfully`,
            severity: 'success',
          });
        }}
        onCancel={() => setEditDoc(null)}
      />

      <LineItemDialog
        open={!!addItemsDoc}
        mode="add"
        document={addItemsDoc}
        onSave={async (amount) => {
          if (!addItemsDoc) return;
          await addLineItems(addItemsDoc.reference, { amount });
          setAddItemsDoc(null);
          setNotification({
            message: `Added ${amount} line item${amount !== 1 ? 's' : ''} to "${addItemsDoc.reference}"`,
            severity: 'success',
          });
        }}
        onCancel={() => setAddItemsDoc(null)}
      />

      <LineItemDialog
        open={!!removeItemsDoc}
        mode="remove"
        document={removeItemsDoc}
        onSave={async (amount) => {
          if (!removeItemsDoc) return;
          await removeLineItems(removeItemsDoc.reference, { amount });
          setRemoveItemsDoc(null);
          setNotification({
            message: `Removed ${amount} line item${amount !== 1 ? 's' : ''} from "${removeItemsDoc.reference}"`,
            severity: 'success',
          });
        }}
        onCancel={() => setRemoveItemsDoc(null)}
      />

      <ConfirmDialog
        open={!!deleteDoc}
        document={deleteDoc}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDoc(null)}
      />

      <Notification
        open={!!notification}
        message={notification?.message ?? ''}
        severity={notification?.severity ?? 'success'}
        onClose={() => setNotification(null)}
      />
    </>
  );
}
