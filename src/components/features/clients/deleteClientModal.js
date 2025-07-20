"use client";

import { deleteClient } from "@/store/slices/clientSlice";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";

export default function DeleteClientConfirmationModal({
  close,
  clientName = "",
  clientId = "",
  isOpen = false,
}) {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");

  const isMatch =
    input.trim().toLowerCase() === clientName.trim().toLowerCase();

  const handleDeleteClient = () => {
    dispatch(deleteClient(clientId));
    close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="md"
      backdrop="blur"
      classNames={{
        base: "bg-zinc-950 border border-zinc-800",
        header: "border-b border-zinc-800",
        body: "py-6",
        footer: "border-t border-zinc-800",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-4 text-red-400">
          <Trash2 size={24} />
          <span className="text-xl font-semibold text-white">
            Confirm Client Deletion
          </span>
        </ModalHeader>

        <ModalBody>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            You are about to{" "}
            <span className="text-red-400 font-semibold">
              Permanently Delete
            </span>{" "}
            the client{" "}
            <span className="text-white font-bold">{clientName}</span>. This
            action cannot be undone.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400">
              Type{" "}
              <span className="text-white font-semibold">{clientName}</span> to
              confirm
            </label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter name to confirm"
              classNames={{
                base: "max-w-full",
                input: "bg-zinc-900 text-white",
                inputWrapper:
                  "bg-zinc-900 border-zinc-700 hover:border-zinc-600",
              }}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            onPress={close}
            className="text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={handleDeleteClient}
            isDisabled={!isMatch}
            className="font-bold"
          >
            Delete Client
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
