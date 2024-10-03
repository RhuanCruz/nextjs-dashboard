'use client'

import { useEffect } from "react";

export default function Error( {error , reset} : {error : Error & {digest : string} , reset : () => void}) {  

    useEffect(() => {
        console.log(error);
    }, [error]);

    return (
        <main className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <button
                onClick={() => reset()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
                Try again
            </button>
        </main>
    );
}
    
