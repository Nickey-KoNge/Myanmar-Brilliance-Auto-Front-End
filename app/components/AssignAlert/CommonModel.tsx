// components/CommonModal.tsx
import React from "react";
import styles from "./CommonModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faTimes } from "@fortawesome/free-solid-svg-icons";

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const CommonModal: React.FC<CommonModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
          </div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
          <button className={styles.confirmBtn} onClick={onClose}>
            နားလည်ပါပြီ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonModal;