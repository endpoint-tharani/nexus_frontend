import type { ReactNode } from "react";
import { Box, Breadcrumbs, Divider, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";

export interface Breadcrumb {
  label: string;
  /** Router path. Omit for the current (non-link) page. */
  href?: string;
}

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  /** Right-aligned action slot (e.g. a primary "Create" button). */
  actions?: ReactNode;
  /**
   * Render a horizontal rule below the header block — useful on pages
   * where the header floats above a borderless content area.
   */
  divider?: boolean;
}

/**
 * Standard page header: optional breadcrumb trail, a title + subtitle,
 * and a right-aligned action slot. Used at the top of every dashboard screen.
 *
 * Uses `h5` (not h4) to keep the hierarchy proportional inside the app shell.
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  divider = false,
}: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<MdChevronRight size={14} />}
          aria-label="Breadcrumb"
          sx={{ mb: 1, color: "text.secondary", fontSize: "0.8125rem" }}
        >
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            if (crumb.href && !isLast) {
              return (
                <Link
                  key={i}
                  component={RouterLink}
                  to={crumb.href}
                  underline="hover"
                  color="inherit"
                  sx={{ fontSize: "0.8125rem" }}
                >
                  {crumb.label}
                </Link>
              );
            }
            return (
              <Typography
                key={i}
                color={isLast ? "text.primary" : "text.secondary"}
                sx={{ fontSize: "0.8125rem", fontWeight: isLast ? 600 : 400 }}
              >
                {crumb.label}
              </Typography>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontSize: { xs: "1.375rem", sm: "1.625rem" },
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.025em",
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: { xs: "stretch", sm: "flex-end" },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>

      {divider && <Divider sx={{ mt: 2.5 }} />}
    </Box>
  );
}
