"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ConfirmSubmitButtonProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  triggerVariant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "success" | "warning";
  confirmVariant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "success" | "warning";
  className?: string;
  disabled?: boolean;
};

export function ConfirmSubmitButton({
  triggerLabel,
  title,
  description,
  confirmLabel,
  triggerVariant = "outline",
  confirmVariant = "danger",
  className,
  disabled = false
}: ConfirmSubmitButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleCancel = (event: Event) => {
      event.preventDefault();
      setIsOpen(false);
    };

    const handleClose = () => setIsOpen(false);

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  const submitForm = () => {
    const form = dialogRef.current?.closest("form");
    setIsOpen(false);
    form?.requestSubmit();
  };

  return (
    <>
      <Button type="button" variant={triggerVariant} className={className} disabled={disabled} onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </Button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl border bg-background/95 p-0 text-left shadow-xl backdrop:bg-background/10 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsOpen(false);
          }
        }}
      >
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant={confirmVariant} onClick={submitForm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
