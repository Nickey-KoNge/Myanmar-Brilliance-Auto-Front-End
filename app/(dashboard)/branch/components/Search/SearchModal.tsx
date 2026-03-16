import { Input } from '@/app/components/ui/Input/Input'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@/app/components/ui/Button/Button'
import styles from './Search.module.css'
import React from 'react'

export default function SearchModal({ title }: { title: string }) {
  return (
    <div className={styles.card}>

      <h2 className={styles.title}>{title} Search</h2>
      <hr className={styles.divider} />

      <div className={styles.section}>
        <span className={styles.label}>Searching</span>
        <Input label="" type="text" placeholder={`Search ${title}...`} />
      </div>

      <div className={styles.section}>
        <form className={styles.dateForm}>
          <div className={styles.date}>
            <label>From</label>
            <Input type="date" label="" icon={<FontAwesomeIcon icon={faCalendar} />} />
          </div>

          <div className={styles.date}>
            <label>To</label>
            <Input type="date" label="" icon={<FontAwesomeIcon icon={faCalendar} />} />
          </div>
        </form>
      </div>

      <Button className={styles.reset}>Reset Filters</Button>

      <hr className={styles.divider} />

      <div className={styles.recent}>
     
      </div>

    </div>
  )
}