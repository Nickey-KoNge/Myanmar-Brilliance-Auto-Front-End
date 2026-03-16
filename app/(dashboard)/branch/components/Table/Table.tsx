import React from "react";
import styles from "./Table.module.css";
import { useRouter } from "next/navigation";


export default function DynamicTable({ data, title }: { data: any[]; title: string }) {
    const router = useRouter();


  if (!Array.isArray(data) || data.length === 0) return <p>No data available</p>; 

  const columns = Object.keys(data[0] || {}).filter(
    col => col !== "id" && col !== "company_id" 
  ); 
 

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title} Master Records</h2>
      <div className={styles['table-scroll']}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} className={styles.col}>
                  {col.replace("_", " ")}
                </th>
              ))} 
              <th className={styles.col}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={index} onClick={()=>router.push(`/branch/Updatebranch/${row.id}`)  }>
                
                {columns.map((col) => (
                  <td key={col} className={styles.colData}>
                    {row[col]} 
                  </td>
                ))}

                  {/* {typeof row[col] === "object" ? (
                      Array.isArray(row[col]) ? (
                        row[col]
                          .map((item) =>
                            typeof item === "object"
                              ? Object.entries(item)
                                  .filter(([key]) => key !== "id") // Exclude "id"
                                  .map(([_, value]) => value) // Only show values
                                  .join(", ")
                              : item
                          )
                          .join("; ")
                      ) : (
                        Object.entries(row[col] || {})
                          .filter(([key]) => key !== "id") // Exclude "id"
                          .map(([_, value]) => value) // Only show values
                          .join(", ")
                      )
                    ) : (
                      row[col]
                    )} */}

                <td className={styles.actions}>
                  <button className={styles.deleteBtn}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}