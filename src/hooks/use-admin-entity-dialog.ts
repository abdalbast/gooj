import { useCallback, useState } from "react";

interface UseAdminEntityDialogOptions<TRecord, TForm> {
  createDefaultForm: () => TForm;
  toForm: (record: TRecord) => TForm;
}

export const useAdminEntityDialog = <TRecord, TForm>({
  createDefaultForm,
  toForm,
}: UseAdminEntityDialogOptions<TRecord, TForm>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TRecord | null>(null);
  const [form, setForm] = useState<TForm>(() => createDefaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetDialogState = useCallback(() => {
    setEditingRecord(null);
    setForm(createDefaultForm());
    setErrors({});
  }, [createDefaultForm]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);

      if (!open) {
        resetDialogState();
      }
    },
    [resetDialogState],
  );

  const openAddDialog = useCallback(() => {
    resetDialogState();
    setDialogOpen(true);
  }, [resetDialogState]);

  const openEditDialog = useCallback(
    (record: TRecord) => {
      setEditingRecord(record);
      setForm(toForm(record));
      setErrors({});
      setDialogOpen(true);
    },
    [toForm],
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    resetDialogState();
  }, [resetDialogState]);

  return {
    closeDialog,
    dialogOpen,
    editingRecord,
    errors,
    form,
    handleDialogOpenChange,
    openAddDialog,
    openEditDialog,
    resetDialogState,
    setDialogOpen,
    setErrors,
    setForm,
  };
};
