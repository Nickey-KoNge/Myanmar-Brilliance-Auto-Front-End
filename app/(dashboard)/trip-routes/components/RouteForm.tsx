"use client";




import { FormCard } from "@/app/components/ui/FormCard/FormCard";
import { apiClient } from "@/app/features/lib/api-client";
import { faArrowsRotate, faCar, faCircleCheck, faCircleXmark, faLocationDot, faLocationPin, faLocationPinLock, faMap, faMapLocation, faMapLocationDot, faRoute } from "@fortawesome/free-solid-svg-icons";
import { Route } from "next";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./RouteForm.module.css"
import { Input } from "@/app/components/ui/Input/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PageHeader } from "@/app/components/ui/PageHeader/pageheader";
import NavigationBtn from "@/app/components/ui/Button/NavigationBtn";
import ActionBtn from "@/app/components/ui/Button/ActionBtn";
import TextInput from "@/app/components/ui/Inputs/TextInput";





export interface RouteFormData {
  route_name: string;
  start_location: string;
  end_location: string;
}
interface RouteFormProps {
    mode:"create" | "update";
    initialData?:Partial<RouteFormData>;
    onSubmit:SubmitHandler<RouteFormData>;
    loading?:boolean;
    onClose:()=>void;
}


export const RouteForm:React.FC<RouteFormProps>=({
    mode,
    initialData,
    onSubmit,
    loading=false,
    onClose,
    
})=>{
 

    const {
        register,
        handleSubmit,
        reset,
        formState:{errors},
    }=useForm<RouteFormData>({
        mode:"onTouched",
        defaultValues:initialData || {},
    });

    const [modalOpen, setModalOpen] = useState(false);

    



    return(
        <>
        {/* <div className={styles.RouteFormHeader}>
             <button className={styles.modalClose} onClick={onClose}  style={{fontSize:"1.5rem",color:"white"}}>
         <FontAwesomeIcon icon={faCircleXmark}  />
        </button>
        </div> */}

            {/* <PageHeader
        titleData={{
          icon: <FontAwesomeIcon icon={faCar} />,
          text: mode === "create" ? "Route Operation" : "Update Route",
          description:
            mode === "create" ? "CREATE NEW ROUTE" : "UPDATE ROUTE",
        }}
        
      /> */}
      

        <form id="routeForm" onSubmit={handleSubmit(onSubmit)}>
            <FormCard title="ROUTE ASSIGNMENT" icon={faMapLocationDot}>
                <div className={styles.filterContainer}>
                    <TextInput 
                     label="Route Name"
                     type="text"
                     placeholder="Enter Route Info"
                     rightIcon={faMap}
                     {...register("route_name",{required:"Route Name is required"})}
                     error={errors.route_name?.message}/>



                    <TextInput 
                     label="Start Location"
                     type="text"
                     placeholder="Enter Start Location"
                     rightIcon={faMapLocation}
                     {...register("start_location",{required:"Start Location is required"})}
                     error={errors.start_location?.message}/>


                    <TextInput 
                     label="End Location"
                     type="text"
                     placeholder="Enter End Location"
                     rightIcon={faRoute}
                     {...register("end_location",{required:"End Location is required"})}
                     error={errors.end_location?.message}/>

                         <div className={styles.formActionArea}>
                         <NavigationBtn
                                href="#"
                                variant="cancel"
                                onClick={(e) => {
                                e.preventDefault();
                            onClose(); 
                            }}
                            >
  cancel
</NavigationBtn>


                <ActionBtn
                type="submit"
                form="routeForm"
                leftIcon={faCircleCheck}
                disabled={loading}
                >
                    {mode==="create" ? "Create Route" : "Update Route"}
                </ActionBtn>
            </div>

                     

                </div>
            </FormCard>

       





        </form>
        
        </>
    )

}