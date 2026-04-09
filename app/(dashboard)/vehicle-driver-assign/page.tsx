import GridColumnsLayout from "@/app/components/layout/GridColumns/Layout/GridColumnLayout";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faSearch, faUser } from "@fortawesome/free-solid-svg-icons";
import TextInput from "@/app/components/ui/SearchBoxes/TextInput";
import Column from "@/app/components/layout/GridColumns/Column/Column";
import ColumnCard from "@/app/components/layout/GridColumns/ColumnCard/ColumnCard";

export default function VehicleDriverAssignPage() {
  return (
    <div className={styles.container}>
      <GridColumnsLayout>
        <Column
          leftIcon={<FontAwesomeIcon icon={faUser} />}
          title="Drivers"
          count={15}
          searchSlot={
            <TextInput
              placeholder="Search Drivers"
              leftIcon={faSearch}
            ></TextInput>
          }
        >
          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 1111"}
            image="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg"
            title="U Min Min Aung"
            nrc="1/PaPaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 3333"}
            image="https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80"
            title="U Soe Ye Lin"
            nrc="1/KaKaKa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>

          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 1111"}
            image="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg"
            title="U Min Min Aung"
            nrc="1/PaPaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 3333"}
            image="https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80"
            title="U Soe Ye Lin"
            nrc="1/KaKaKa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>

          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 1111"}
            image="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg"
            title="U Min Min Aung"
            nrc="1/PaPaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 3333"}
            image="https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80"
            title="U Soe Ye Lin"
            nrc="1/KaKaKa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>

          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 1111"}
            image="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg"
            title="U Min Min Aung"
            nrc="1/PaPaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 3333"}
            image="https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80"
            title="U Soe Ye Lin"
            nrc="1/KaKaKa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>

          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 1111"}
            image="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg"
            title="U Min Min Aung"
            nrc="1/PaPaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 3333"}
            image="https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80"
            title="U Soe Ye Lin"
            nrc="1/KaKaKa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>

          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 1111"}
            image="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg"
            title="U Min Min Aung"
            nrc="1/PaPaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 3333"}
            image="https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80"
            title="U Soe Ye Lin"
            nrc="1/KaKaKa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>

          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 1111"}
            image="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg"
            title="U Min Min Aung"
            nrc="1/PaPaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 3333"}
            image="https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80"
            title="U Soe Ye Lin"
            nrc="1/KaKaKa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>

          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 1111"}
            image="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg"
            title="U Min Min Aung"
            nrc="1/PaPaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 3333"}
            image="https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80"
            title="U Soe Ye Lin"
            nrc="1/KaKaKa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>

          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 1111"}
            image="https://img.freepik.com/free-photo/happy-man-student-with-afro-hairdo-shows-white-teeth-being-good-mood-after-classes_273609-16608.jpg"
            title="U Min Min Aung"
            nrc="1/PaPaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          <ColumnCard
            badge={"D 3333"}
            image="https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80"
            title="U Soe Ye Lin"
            nrc="1/KaKaKa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>

          <ColumnCard
            badge={"D 2222"}
            image="https://img.freepik.com/free-photo/handsome-young-cheerful-man-with-arms-crossed_171337-1073.jpg"
            title="U Win Naing Min"
            nrc="12/PaKaNa(N)123456"
            phone="+95 9 123456789"
          ></ColumnCard>
          
        </Column>

        <Column
          leftIcon={<FontAwesomeIcon icon={faCar} />}
          title="Vehicles"
          count={15}
          searchSlot={
            <TextInput
              placeholder="Search Vehicles"
              leftIcon={faSearch}
            ></TextInput>
          }
        >
          <ColumnCard
            badge={"YGN-B/1212"}
            backgroundImage="https://res.cloudinary.com/total-dealer/image/upload/v1/production/jnocepvxkhbl2tlwksbi4m32iojx.jpg"
            title="Vehicle 1"
            odometer="50,000"
          ></ColumnCard>
          <ColumnCard
            badge={"YGN-B/1212"}
            backgroundImage="https://res.cloudinary.com/total-dealer/image/upload/v1/production/jnocepvxkhbl2tlwksbi4m32iojx.jpg"
            title="Vehicle 1"
            odometer="50,000"
          ></ColumnCard>
          <ColumnCard
            badge={"YGN-B/1212"}
            backgroundImage="https://res.cloudinary.com/total-dealer/image/upload/v1/production/jnocepvxkhbl2tlwksbi4m32iojx.jpg"
            title="Vehicle 1"
            odometer="50,000"
          ></ColumnCard>
        </Column>

        <Column
          title="Vehicles"
          count={15}
          searchSlot={
            <TextInput
              placeholder="Search Vehicles"
              leftIcon={faSearch}
            ></TextInput>
          }
        >
          <div className={styles.columnContent}>
            <p>Vehicle 1</p>
          </div>
          <div className={styles.columnContent}>
            <p>Vehicle 2</p>
          </div>
          <div className={styles.columnContent}>
            <p>Vehicle 3</p>
          </div>
        </Column>
      </GridColumnsLayout>
    </div>
  );
}
