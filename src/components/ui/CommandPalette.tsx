import { useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../core/navigation";
import {
  Avatar,
  Box,
  Dialog,
  Divider,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import {
  MdSearch,
} from "react-icons/md";
import type { IconType } from "react-icons";

interface NavItem {
  label: string;
  description: string;
  path: string;
  Icon: IconType;
  keywords: string[];
}

const ROUTE_META: Record<string, { description: string; keywords: string[] }> = {
  "/dashboard": { description: "Organization overview", keywords: ["home", "overview"] },
  "/dashboard/organization-manager": { description: "Manage organization, branches, and departments", keywords: ["organization", "org", "branch", "department", "manager"] },
  "/dashboard/profile": { description: "Your profile settings", keywords: ["profile", "account", "me"] },
  "/dashboard/sessions": { description: "Your active login sessions", keywords: ["sessions", "devices", "security"] },
};

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}



export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { sections, accountItems } = useSidebar();

  const dynamicItems = useMemo(() => {
    const rawItems = [
      ...sections.flatMap((section) => section.items),
      ...accountItems,
    ];

    const seenPaths = new Set<string>();
    const items: NavItem[] = [];

    for (const item of rawItems) {
      const path = item.path;
      if (seenPaths.has(path)) continue;
      seenPaths.add(path);

      const meta = ROUTE_META[path] ?? { description: `Go to ${item.label}`, keywords: [] };
      items.push({
        label: item.label,
        description: meta.description,
        path,
        Icon: item.icon,
        keywords: meta.keywords,
      });
    }

    return items;
  }, [sections, accountItems]);

  // Filter nav items on query
  const filtered = query.trim()
    ? dynamicItems.filter(({ label, description, keywords }) => {
        const q = query.toLowerCase();
        return (
          label.toLowerCase().includes(q) ||
          description.toLowerCase().includes(q) ||
          keywords.some((k) => k.includes(q))
        );
      })
    : dynamicItems;

  const activeItemIndex = Math.min(activeIndex, Math.max(0, filtered.length - 1));

  const closePalette = () => {
    setQuery("");
    setActiveIndex(0);
    onClose();
  };

  const handleSelect = (path: string) => {
    navigate(path);
    closePalette();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(Math.min(activeItemIndex + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(Math.max(activeItemIndex - 1, 0));
    } else if (e.key === "Enter" && filtered[activeItemIndex]) {
      handleSelect(filtered[activeItemIndex].path);
    } else if (e.key === "Escape") {
      closePalette();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={closePalette}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
            overflow: "hidden",
            mt: { xs: 4, md: 8 },
            alignSelf: "flex-start",
          },
        },
        backdrop: {
          sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(15,23,42,0.4)" },
        },
      }}
      aria-label="Command palette"
    >
      {/* Search input */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <TextField
          inputRef={inputRef}
          autoFocus
          fullWidth
          variant="standard"
          placeholder="Search pages and actions…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          slotProps={{
            input: {
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={20} style={{ color: "#94A3B8" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiInputBase-root": {
              fontSize: "1rem",
              fontWeight: 500,
              py: 0.75,
            },
          }}
          aria-label="Command search"
        />
      </Box>

      <Divider />

      {/* Results */}
      <Box sx={{ maxHeight: 380, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No results for <strong>"{query}"</strong>
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.7rem" }}>
                Navigation
              </Typography>
            </Box>
            <List dense disablePadding sx={{ px: 1, pb: 1.5 }}>
              {filtered.map((item, i) => {
                const Icon = item.Icon;
                const isActive = i === activeItemIndex;
                return (
                  <ListItemButton
                    key={item.path}
                    selected={isActive}
                    onClick={() => handleSelect(item.path)}
                    onMouseEnter={() => setActiveIndex(i)}
                    sx={{
                      borderRadius: "8px",
                      mb: 0.25,
                      px: 1.5,
                      py: 1,
                      "&.Mui-selected": {
                        bgcolor: "rgba(37,99,235,0.08)",
                        "&:hover": { bgcolor: "rgba(37,99,235,0.12)" },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: isActive ? "rgba(37,99,235,0.12)" : "#F1F5F9",
                          color: isActive ? "primary.main" : "text.secondary",
                          borderRadius: "6px",
                        }}
                      >
                        <Icon size={15} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      slotProps={{
                        primary: { sx: { fontWeight: isActive ? 600 : 500, fontSize: "0.875rem" } },
                        secondary: { sx: { fontSize: "0.75rem" } },
                      }}
                    />
                    {isActive && (
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem", flexShrink: 0 }}>
                        ↵ Enter
                      </Typography>
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </>
        )}
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
          <kbd style={{ background: "#F1F5F9", border: "1px solid #E5E7EB", borderRadius: 4, padding: "1px 5px", fontFamily: "inherit" }}>↑↓</kbd> navigate
          &nbsp;&nbsp;
          <kbd style={{ background: "#F1F5F9", border: "1px solid #E5E7EB", borderRadius: 4, padding: "1px 5px", fontFamily: "inherit" }}>↵</kbd> open
          &nbsp;&nbsp;
          <kbd style={{ background: "#F1F5F9", border: "1px solid #E5E7EB", borderRadius: 4, padding: "1px 5px", fontFamily: "inherit" }}>Esc</kbd> close
        </Typography>
      </Box>
    </Dialog>
  );
}
