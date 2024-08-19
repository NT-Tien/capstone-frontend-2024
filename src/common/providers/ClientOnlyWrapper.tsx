"use client"

import { ReactNode, useEffect, useState } from "react";

export default function ClientOnlyWrapper({children}: {children: ReactNode}) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
}