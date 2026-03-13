"use client";

import styles from "./Table.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function Table() {
  const staffs = [
    {
      name: "Aung",
      email: "aung@gmail.com",
      address: "Yangon",
      role: "Driver",
      branch: "Yangon Branch",
      phone: "091231223123",
      img: "/example.jpg",
    },
    {
      name: "Min",
      email: "min@gmail.com",
      address: "Mandalay",
      role: "Cleaner",
      branch: "Mandalay Branch (Hlaing Tharyar)",
      phone: "091231223124",
      img: "/example.jpg",
    },
    {
      name: "Hla",
      email: "hla@gmail.com",
      address: "Naypyidaw",
      role: "Manager",
      branch: "Naypyidaw Branch",
      phone: "091231223125",
      img: "/example.jpg",
    },
    {
      name: "Soe",
      email: "soe@gmail.com",
      address: "Yangon",
      role: "Driver",
      branch: "Yangon Branch",
      phone: "091231223126",
      img: "/example.jpg",
    },
    {
      name: "Win",
      email: "win@gmail.com",
      address: "Mandalay",
      role: "Cleaner",
      branch: "Mandalay Branch",
      phone: "091231223127",
      img: "/example.jpg",
    },
    {
      name: "Thant",
      email: "thant@gmail.com",
      address: "Yangon",
      role: "Accountant",
      branch: "Yangon Branch",
      phone: "091231223128",
      img: "/example.jpg",
    },
    {
      name: "Khin",
      email: "khin@gmail.com",
      address: "Naypyidaw",
      role: "Manager",
      branch: "Naypyidaw Branch",
      phone: "091231223129",
      img: "/example.jpg",
    },
    {
      name: "Zaw",
      email: "zaw@gmail.com",
      address: "Mandalay",
      role: "Driver",
      branch: "Mandalay Branch",
      phone: "091231223130",
      img: "/example.jpg",
    },
    {
      name: "Tun",
      email: "tun@gmail.com",
      address: "Yangon",
      role: "Cleaner",
      branch: "Yangon Branch",
      phone: "091231223131",
      img: "/example.jpg",
    },
    {
      name: "Ei",
      email: "ei@gmail.com",
      address: "Naypyidaw",
      role: "Manager",
      branch: "Naypyidaw Branch",
      phone: "091231223132",
      img: "/example.jpg",
    },
  ];

  return (
    <div className={styles.gridContainer}>
      <div className={styles.gridBox}>
        {/* title */}
        <p className={styles.gridBoxTitle}>EMPLOYEE MASTER RECORDS</p>

        {/* table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Staff Info</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {staffs.map((staff, index) => (
              <tr key={index}>
                <td className={styles.staffInfo}>
                  <Image
                    src={staff.img}
                    alt={staff.name}
                    width={40}
                    height={40}
                  />
                  <span>{staff.name}</span>
                </td>
                <td>{staff.email}</td>
                <td>{staff.address}</td>
                <td>{staff.role}</td>
                <td>{staff.branch}</td>
                <td>{staff.phone}</td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => alert(`Delete ${staff.name} Test`)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* pagination */}
        <div className={styles.pagination}>
          <p>
            Showing <span className={styles.spanText}>{1}</span> to{" "}
            <span className={styles.spanText}>{10}</span> of{" "}
            <span className={styles.spanText}>{200}</span> total records.
          </p>
          <p>
            Page <span className={styles.spanText}>{1}</span> of{" "}
            <span className={styles.spanText}>{20}</span>
            <button>
              <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
              <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
            </button>
          </p>
        </div>
      </div>

      <div className={styles.gridBox}>
        <p className={styles.gridBoxTitle}>Employee Search</p>
        {/* You can add a search input or filter here */}
      </div>
    </div>
  );
}
