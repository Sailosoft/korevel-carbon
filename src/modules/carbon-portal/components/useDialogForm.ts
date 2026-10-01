import { useState, type Dispatch, type SetStateAction } from "react";

type DialogFormApi<TForm> = {
  form: TForm;
  setForm: Dispatch<SetStateAction<TForm>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
};

/**
 * Form state for dialogs: rebuilt whenever the dialog opens or the edited
 * record changes. Uses the render-phase state adjustment pattern instead of
 * an effect to satisfy react-hooks/set-state-in-effect.
 */
export function useDialogForm<TForm, TRecord extends { id?: string } | null>(
  open: boolean,
  record: TRecord,
  build: (record: TRecord) => TForm,
): DialogFormApi<TForm> {
  const [form, setForm] = useState(() => build(record));
  const [error, setError] = useState<string | null>(null);
  const [previous, setPrevious] = useState({
    open,
    recordId: record?.id ?? null,
  });

  const recordId = record?.id ?? null;
  if (previous.open !== open || previous.recordId !== recordId) {
    setPrevious({ open, recordId });
    if (open) {
      setForm(build(record));
      setError(null);
    }
  }

  return { form, setForm, error, setError };
}
