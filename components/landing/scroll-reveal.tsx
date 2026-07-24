"use client"

import { useEffect, useRef, useState, ReactNode } from "react"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number // delay in ms
  direction?: "up" | "down" | "left" | "right"
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const getTransform = () => {
    if (isVisible) return "translate-x-0 translate-y-0 opacity-100"
    switch (direction) {
      case "up":
        return "translate-y-12 opacity-0"
      case "down":
        return "-translate-y-12 opacity-0"
      case "left":
        return "translate-x-12 opacity-0"
      case "right":
        return "-translate-x-12 opacity-0"
      default:
        return "translate-y-12 opacity-0"
    }
  }

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${getTransform()} ${className}`}
    >
      {children}
    </div>
  )
}
