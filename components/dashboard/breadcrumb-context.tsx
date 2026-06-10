"use client"

import React, {createContext, useContext, useState, useCallback } from "react"

type BreadcrumbContextType = {
    labels: Record<string, string>
    setLabel: (segment: string, label: string) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
    const [labels, setLabels] = useState<Record<string, string>>({})

    const setLabel = useCallback((segment: string, label: string) => {
        setLabels((prev) => {
            if (prev[segment] === label) return prev
            return { ...prev, [segment]: label }
        })
    }, [])

    return (
        <BreadcrumbContext.Provider value={{ labels, setLabel }}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

export function useBreadcrumbs() {
    const context = useContext(BreadcrumbContext)
    if (!context) {
        throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider")
    }
    return context
}

export function SetBreadcrumbLabel({ segment, label }: { segment: string, label: string }) {
    const { setLabel } = useBreadcrumbs()

    React.useEffect(() => {
        if (segment && label) {
            setLabel(segment, label)
        }
    }, [segment, label, setLabel])
    return null
}