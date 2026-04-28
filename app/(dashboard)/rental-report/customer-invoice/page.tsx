"use client";

import { useState } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import { PageGridLayout } from "@/app/components/layout/PageGridLayout/PageGridLayout";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import styles from "../page.module.css"; // 🌟

// Interfaces...
interface TripFinance {
  rental_amount: string | number;
  overtime_amount: string | number;
}

interface InvoiceData {
  id: string | number;
  driver?: { driver_name?: string };
  vehicle?: { plate_number?: string };
  route?: { route_name?: string };
  trip_finances?: TripFinance[];
}

export default function TripInvoicePage() {
  const [tripId, setTripId] = useState("");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchInvoice = async () => {
    if (!tripId) return alert("Please enter Trip ID");
    setIsLoading(true);
    try {
      const response = (await apiClient.get(
        `/reports/customer-invoice/${tripId}`,
      )) as InvoiceData;
      setInvoice(response);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setInvoice(null);
      alert("Invoice not found!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageGridLayout
      sidebar={
        <div className={styles.sidebarWrapper}>
          <p className={styles.gridBoxTitle}>Search Invoice</p>
          {/* 🌟 Inline Style အစား CSS class ပြောင်းသုံးထားပါသည် */}
          <input
            type="text"
            placeholder="Enter Trip ID"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            className={styles.searchInput}
            style={{ marginBottom: "1rem" }}
          />
          <ActionBtn variant="action" fullWidth onClick={fetchInvoice}>
            Find Invoice
          </ActionBtn>
        </div>
      }
    >
      <div>
        <h2 className={styles.tableTitle}>Customer Trip Invoice</h2>

        {/* 🌟 Loading Text */}
        {isLoading && (
          <div className={styles.loadingText}>Loading Invoice...</div>
        )}

        {invoice && (
          /* 🌟 Inline Style အစား CSS class ပြောင်းသုံးထားပါသည် */
          <div className={styles.invoiceCard}>
            <h3 className={styles.invoiceHeader}>Invoice Receipt</h3>
            <p>
              <strong>Trip ID:</strong> {invoice.id}
            </p>
            <p>
              <strong>Customer/Driver:</strong> {invoice.driver?.driver_name}
            </p>
            <p>
              <strong>Vehicle:</strong> {invoice.vehicle?.plate_number}
            </p>
            <p>
              <strong>Route:</strong> {invoice.route?.route_name}
            </p>

            <h4 style={{ marginTop: "20px" }} className={styles.textBold}>
              Financial Details
            </h4>

            {invoice.trip_finances && invoice.trip_finances.length > 0 ? (
              /* 🌟 Inline Style အစား CSS class ပြောင်းသုံးထားပါသည် */
              <div className={styles.financeBox}>
                <p>Base Rental: {invoice.trip_finances[0].rental_amount} Ks</p>
                <p>Overtime: {invoice.trip_finances[0].overtime_amount} Ks</p>
                <div className={styles.totalAmount}>
                  Total:{" "}
                  {Number(invoice.trip_finances[0].rental_amount) +
                    Number(invoice.trip_finances[0].overtime_amount)}{" "}
                  Ks
                </div>
              </div>
            ) : (
              <p className={styles.textMuted} style={{ marginTop: "10px" }}>
                No finance data attached to this trip yet.
              </p>
            )}

            <div style={{ marginTop: "20px" }}>
              <ActionBtn variant="action" onClick={() => window.print()}>
                Print Invoice
              </ActionBtn>
            </div>
          </div>
        )}
      </div>
    </PageGridLayout>
  );
}
