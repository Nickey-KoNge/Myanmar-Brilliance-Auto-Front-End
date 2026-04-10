import { CSSProperties, useMemo } from "react";
import styles from "./ColumnCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGaugeHigh, faPhone, faIdCard } from "@fortawesome/free-solid-svg-icons";

type ColumnCardProps = {
  badge?: number | string;
  image?: string;
  backgroundImage?: string;
  title?: string;
  nrc?: string;
  phone?: string;
  odometer?: string;
  className?: string;
};

export default function ColumnCard({
  badge,
  image,
  backgroundImage,
  title = "Unknown",
  nrc,
  phone,
  odometer,
  className = "",
}: ColumnCardProps) {
  const cardStyle = useMemo(
    () => ({
      "--bg-image": backgroundImage ? `url('${backgroundImage}')` : "none",
    } as CSSProperties),
    [backgroundImage]
  );

  return (
    <div
      className={`${styles.columnCard} ${backgroundImage ? styles.hasBg : styles.noBg} ${className}`}
      style={cardStyle}
    >
      {/* 1. Overlay for Vehicles (only shows if backgroundImage exists) */}
      {backgroundImage && <div className={styles.overlay} />}
      
      {/* 2. Top Right Badge (License Plate or Driver ID) */}
      {badge !== undefined && (
        <span className={styles.topBadge}>{badge}</span>
      )}

      <div className={styles.content}>
        {/* 3. Driver Image: Only shows if it's a Driver card */}
        {image && !backgroundImage && (
          <div className={styles.avatarWrapper}>
            <img src={image} alt={title} className={styles.avatar} loading="lazy" />
          </div>
        )}

        {/* 4. Text Information */}
        <div className={styles.textGroup}>
          <h3 className={styles.title}>{title}</h3>
          
          <div className={styles.details}>
            {nrc && (
              <div className={styles.detailItem}>
                <FontAwesomeIcon icon={faIdCard} className={styles.icon} />
                <span>{nrc}</span>
              </div>
            )}
            
            {phone && (
              <div className={styles.detailItem}>
                <FontAwesomeIcon icon={faPhone} className={styles.icon} />
                <span>{phone}</span>
              </div>
            )}

            {odometer && (
              <div className={styles.detailItem}>
                <FontAwesomeIcon icon={faGaugeHigh} className={styles.icon} />
                <span>{odometer} km</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}