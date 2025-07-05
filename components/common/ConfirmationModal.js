"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger', 'warning', 'info'
  isLoading = false,
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-red-400" />,
          titleColor: "text-red-400",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
          titleColor: "text-yellow-400",
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-400" />,
          titleColor: "text-blue-400",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      classNames={{
        backdrop: "bg-black/80",
        base: "bg-zinc-950 border border-zinc-800/50",
        header: "border-b border-zinc-800",
        footer: "border-t border-zinc-800",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          {styles.icon}
          <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
            {title}
          </h3>
        </ModalHeader>

        <ModalBody className="py-6">
          <p className="text-zinc-300 text-sm leading-relaxed">{message}</p>
        </ModalBody>

        <ModalFooter className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onPress={onClose}
            isDisabled={isLoading}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            {cancelText}
          </Button>
          <Button
            color={
              variant === "danger"
                ? "danger"
                : variant === "warning"
                ? "warning"
                : "primary"
            }
            onPress={onConfirm}
            isLoading={isLoading}
            className="font-medium"
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
