import { Navbar } from "@/components/navbar";
import React, { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs"
const Layout = ({children}:{children:ReactNode}) =>{

    return (
        <>
        <ClerkProvider>
        <Navbar/>
        {children}
        </ClerkProvider>
        </>
    )

}
export default Layout;