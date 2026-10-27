import type { FormEvent, ReactNode } from "react";
import { Box, Divider, Drawer, IconButton, Typography } from "@mui/material";
import { MdClose } from "react-icons/md";

export interface FormDrawerProps {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  /** Footer actions (buttons). Pinned to the bottom of the drawer. */
  actions?: ReactNode;
  onClose: () => void;
  /** When provided, content + footer are wrapped in a <form>. */
  onSubmit?: () => void;
  anchor?: "left" | "right";
  width?: number | string;
}

// Drawer variant of FormDialog — for longer forms or detail panels that benefit
// from a side sheet instead of a centered modal. Header + scrollable body +
// pinned footer.
export default function FormDrawer({
  open,
  title,
  children,
  actions,
  onClose,
  onSubmit,
  anchor = "right",
  width = 440,
}: FormDrawerProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: width }, maxWidth: "100vw" } } }}
    >
      <Box
        component={onSubmit ? "form" : "div"}
        onSubmit={onSubmit ? handleSubmit : undefined}
        noValidate
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2.5,
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close" edge="end">
            <MdClose size={20} />
          </IconButton>
        </Box>
        <Divider />

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>{children}</Box>

        {/* Footer */}
        {actions && (
          <>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, px: 2.5, py: 2 }}>
              {actions}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
