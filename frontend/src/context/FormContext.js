import { createContext, useState, useEffect, Children } from "react";

const FormContext = createContext({})

export const FormProvider = ({ Children }) => {

    return (
        <FormContext.Provider value={{}}>
            { Children }
        </FormContext.Provider>
    )
}

export default FormContext;