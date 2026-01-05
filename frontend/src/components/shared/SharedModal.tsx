import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const SharedModal: React.FC<SharedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${maxWidth} max-h-[85vh] flex flex-col`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <div className="sr-only">
            <DialogDescription>
              {title} modal
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
