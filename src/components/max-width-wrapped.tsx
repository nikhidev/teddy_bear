import { cn } from "@/utils";
import { ReactNode } from "react";
interface MaxWidthWrappedProps{
    className?:String
    children:ReactNode
}
export const MaxWidthWrapped =({
    className,
    children,
}:MaxWidthWrappedProps)=>{
    return (
        <div className={cn("h-full max-auto w-full max-w-screen-xl px-2.5 md:px-20",className)}>
            {children}
        </div>
    )
}