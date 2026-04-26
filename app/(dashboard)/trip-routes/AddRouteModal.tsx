"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RouteForm, RouteFormData } from "./components/RouteForm";
import styles from "./page.module.css";
import { faCircleXmark, faTimes } from "@fortawesome/free-solid-svg-icons";

interface AddRouteModalProps {
  open: boolean;
  mode: "create" | "update";
  initialData?: Partial<RouteFormData>;
  onClose: () => void;
  onSubmit: (data: RouteFormData) => void;
}

export default function AddRouteModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}: AddRouteModalProps) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      
        {/* <button className={styles.modalClose} onClick={onClose}>
         <FontAwesomeIcon icon={faCircleXmark} style={{fontSize:"1.5rem",color:"white"}} />
        </button> */}
       

        
        <RouteForm mode={mode} initialData={initialData} onSubmit={onSubmit} onClose={onClose} />
        </div>
      
    
  );
}