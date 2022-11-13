import { route } from "preact-router";
import { useEffect } from "preact/hooks";

interface RedirectProps{
    path:string;
    to:string;
    replace?:boolean;
}

export function Redirect({to,replace}:RedirectProps){
    useEffect(()=>{
        route(to,replace)
    },[]);
    return null;
}