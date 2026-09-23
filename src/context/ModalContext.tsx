import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Modal, Box, Button, IconButton } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useKeypress } from "../utils/useKeypress";

interface ModalOptions {
  onAccept?: () => void;
  onCancel?: () => void;
  acceptText?: string;
  cancelText?: string;
  acceptColor?: ButtonProps["color"];
  cancelColor?: ButtonProps["color"];
  cancelVariant?: ButtonProps["variant"];
}

interface ModalContextProps {
  showModal: (content: ReactNode, options?: ModalOptions) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [onAccept, setOnAccept] = useState<(() => void) | undefined>();
  const [onCancel, setOnCancel] = useState<(() => void) | undefined>();
  const [acceptText, setAcceptText] = useState<string>("Accept");
  const [cancelText, setCancelText] = useState<string>("Cancel");
  const [acceptColor, setAcceptColor] = useState<ButtonProps["color"]>("primary");
  const [cancelColor, setCancelColor] = useState<ButtonProps["color"]>("error");
  const [cancelVariant, setCancelVariant] = useState<ButtonProps["variant"]>("outlined");

  const hideModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const showModal = useCallback((content: ReactNode, options?: ModalOptions) => {
    setModalContent(content);
    setOnAccept(() => options?.onAccept);
    setOnCancel(() => options?.onCancel || hideModal);
    setAcceptText(options?.acceptText || "Accept");
    setCancelText(options?.cancelText || "Cancel");
    setAcceptColor(options?.acceptColor ?? "primary");
    setCancelColor(options?.cancelColor ?? "error");
    setCancelVariant(options?.cancelVariant ?? "outlined");
    setIsOpen(true);
  }, [hideModal]);

  const cancel = useCallback(() => {
    if (isOpen) {
      onCancel?.();
      hideModal();
    }
  }, [onCancel, hideModal, isOpen]);

  const accept = useCallback(() => {
    if (isOpen) {
      onAccept?.();
      hideModal();
    }
  }, [onAccept, hideModal, isOpen]);

  useKeypress("Escape", cancel);
  useKeypress("Enter", accept);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        open={isOpen}
        onClose={hideModal}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.1)" } },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <div />
            <IconButton onClick={hideModal} sx={{ position: "absolute", top: 8, right: 8 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <div>{modalContent}</div>
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            {onCancel && (
              <Button variant={cancelVariant} color={cancelColor} onClick={cancel}>
                {cancelText}
              </Button>
            )}
            {onAccept && (
              <Button variant="contained" color={acceptColor} onClick={accept}>
                {acceptText}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
