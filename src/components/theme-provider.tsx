"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    // Use a state to track if we're mounting to prevent hydration issues
    const [mounted, setMounted] = React.useState(false);

    // After mounting on the client, we can render the provider
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return children without the provider during SSR
        return <>{children}</>;
    }

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
} 