import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef } from "react"

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  className?: string
}

export const Dialog = ({
  isOpen,
  onClose,
  children,
  className,
}: DialogProps) => {
  // OUTSIDE_CLICK
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutSideClick = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }
    window.addEventListener("mousedown", handleOutSideClick)

    return () => {
      window.removeEventListener("mousedown", handleOutSideClick)
    }
  }, [dialogRef, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          initial="hidden"
          exit="hidden"
          variants={{
            show: { y: 0, opacity: 1 },
            hidden: { y: 60, opacity: 0 },
          }}
          animate={isOpen ? "show" : "animate"}
          transition={{
            type: "spring",
            damping: 40,
            stiffness: 400,
          }}
          className={`fixed inset-0 z-20 m-auto flex h-fit w-10/12 flex-col gap-4 rounded-md bg-surface-sheet-m shadow-lg lg:max-w-screen-sm ${className} backdrop-blur-sm`}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
