import { Input } from '@/app/components/ui/Input/Input'
import { faCalendar, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'
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
            <Input
              type="date"
              label=""
              icon={<FontAwesomeIcon icon={faCalendar} />}
            />
          </div>

          <div className={styles.date}>
            <label>To</label>
            <Input
              type="date"
              label=""
              icon={<FontAwesomeIcon icon={faCalendar} />}
            />
          </div>
        </form>
      </div>

      <Button>Reset Filters</Button>

      <hr className={styles.divider} />

      <div className={styles.recent}>
          <div className={styles.recentHeader}>
            <div className={styles.recentIcon}>
                 <FontAwesomeIcon icon={faClockRotateLeft} />
            </div>
            <span>
              RECENT RECORD
            </span>
              
          </div>

          <div className={styles.recentContent}>
              
            <div className={styles.recordItem}>
              Total Company : <span>1</span>
            </div>

            <div className={styles.recordItem}>
              Active Company : <span className={styles.active}>1</span>
            </div>

            <div className={styles.recordItem}>
              Inactive Company : <span className={styles.inactive}>0</span>
            </div>

            </div>

            <hr  className={styles.divider}/>

   

            <div className={styles.lastEdited}>
              Last Edited : <span>Nickey (Admin)</span>
            </div>


    
          


        
      </div>
    </div>
  )
}
