"use client";

import { TripForm, TripFormData } from "./components/TripForm";

import styles from "./page.module.css";

interface AddTripModalProps {
  open: boolean;
  mode: "create" | "update";
  initialData?: Partial<TripFormData>;
  onClose: () => void;
  onSubmit: (data: TripFormData) => void;
}

export default function AddTripModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}: AddTripModalProps) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <TripForm
        mode={mode}
        initialData={initialData}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </div>
  );
}
