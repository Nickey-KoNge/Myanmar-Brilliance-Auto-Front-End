import React, { useState } from "react";
import styles from "./Table.module.css";
import { useRouter } from "next/navigation";
import DeleteModal from "../Delete/DeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface TableRow {
  id: string;
  [key: string]: any;
}

export default function DynamicTable({
  data,
  title,
  onDeleteSuccess,
}: {
  data: TableRow[];
  title: string;
  onDeleteSuccess: (id: string) => void;
}) {
  const router = useRouter();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const closeModal = () => {
    setShowDeleteModal(false);
    setSelectedRow(null);
  };

  const openDeleteModal = (id: string, name: string) => {
    setSelectedRow({ id, name });
    setShowDeleteModal(true);
  };

  if (!Array.isArray(data) || data.length === 0)
    return <p>No data available</p>;

  const columns = Object.keys(data[0] || {}).filter(
    (col) => col !== "id" && col !== "company_id",
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title} Master Records</h2>
      <div className={styles["table-scroll"]}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className={styles.col}>
                  {col.replace("_", " ")}
                </th>
              ))}
              <th className={styles.col}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => router.push(`/branch/Updatebranch/${row.id}`)}
              >
                {columns.map((col) => (
                  <td key={col} className={styles.colData}>
                    {row[col]}
                  </td>
                ))}

                <td className={styles.actions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation(); //prevent for row click
                      const displayName =
                        row.branches_name ||
                        row.staffName ||
                        row.company_name ||
                        "this record";
                      openDeleteModal(row.id, displayName);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showDeleteModal && selectedRow && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={closeModal}
          id={selectedRow.id}
          onDeleteSuccess={onDeleteSuccess}
          name={"Branch"}
          itemName={selectedRow.name}
          apiRoute="master-company/branches"
        />
      )}
    </div>
  );
}
