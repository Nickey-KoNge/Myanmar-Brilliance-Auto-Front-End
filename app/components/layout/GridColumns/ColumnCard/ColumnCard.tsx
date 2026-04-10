import { CSSProperties, useMemo } from "react";
import styles from "./ColumnCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGaugeHigh, faPhone } from "@fortawesome/free-solid-svg-icons";

type ColumnCardProps = {
  badge?: number | string;
  image?: string;
  backgroundImage?: string;
  title?: string;
  nrc?: string;
  phone?: string;
  odometer?: string;
};

export default function ColumnCard({
  badge,
  image,
  backgroundImage,
  title = "Unknown",
  nrc,
  phone,
  odometer,
}: ColumnCardProps) {
  const cardStyle = useMemo(
    () =>
      ({
        "--bg-image": backgroundImage ? `url('${backgroundImage}')` : "none",
      }) as CSSProperties,
    [backgroundImage],
  );

  return (
    <div
      className={`${styles.columnCard} ${backgroundImage ? styles.hasBg : ""}`}
      style={cardStyle}
      role="article"
    >
      {backgroundImage && <div className={styles.overlay} aria-hidden="true" />}

      {badge !== undefined && badge !== null && (
        <span className={styles.badge}>{badge}</span>
      )}

      <div className={styles.content}>
        {image && (
          <img
            src={image}
            alt={title}
            className={styles.image}
            loading="lazy"
          />
        )}

        <h3 className={styles.title}>{title}</h3>

        <div className={styles.details}>
          {nrc && <p className={styles.detailItem}>{nrc}</p>}

          {phone && (
            <p className={styles.detailItem}>
              <FontAwesomeIcon
                icon={faPhone}
                className={styles.icon}
                aria-hidden="true"
              />
              <span>{phone}</span>
            </p>
          )}

          {odometer && (
            <p className={styles.detailItem}>
              <FontAwesomeIcon
                icon={faGaugeHigh}
                className={styles.icon}
                aria-hidden="true"
              />
              <span>{odometer}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
