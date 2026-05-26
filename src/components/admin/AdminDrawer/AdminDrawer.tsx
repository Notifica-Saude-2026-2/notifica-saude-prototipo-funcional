import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import cubeIcon from "../../../assets/cube.svg";
import fireIcon from "../../../assets/fire.svg";
import airplaneIcon from "../../../assets/airplane.svg";
import archiveIcon from "../../../assets/archive.svg";
import menuIcon from "../../../assets/menu-hamburguer.svg";
import arrowExitIcon from "../../../assets/arrow-exit.svg";
import { useAuth } from "../../../hooks/useAuth";
import styles from "./AdminDrawer.module.css";

const DRAWER_WIDTH_OPEN = 260;
const DRAWER_WIDTH_CLOSED = 64;
const ACTIVE_COLOR = "#131D53";

type NavItem = {
  label: string;
  icon: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Todos incidentes", icon: cubeIcon, path: "/admin" },
  { label: "Novos incidentes", icon: fireIcon, path: "/admin/novos" },
  { label: "Encaminhados", icon: airplaneIcon, path: "/admin/encaminhados" },
  { label: "Arquivados", icon: archiveIcon, path: "/admin/resolvidos" },
];

function getInitials(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function readOpenState(): boolean {
  try {
    const saved = localStorage.getItem("admin-drawer-open");
    return saved !== null ? saved === "true" : true;
  } catch {
    return true;
  }
}

function saveOpenState(value: boolean) {
  try {
    localStorage.setItem("admin-drawer-open", String(value));
  } catch {
    // ignore
  }
}

type Props = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function AdminDrawer({ mobileOpen = false, onMobileClose }: Props) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = useState(readOpenState);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const nome = usuario?.nome ?? "Usuário";
  const email = usuario?.email ?? "";
  const initials = getInitials(nome);

  // No mobile, drawer é sempre exibido expandido (ou oculto)
  const isExpanded = isMobile ? true : open;

  function toggleDrawer() {
    if (isMobile) {
      onMobileClose?.();
    } else {
      setOpen((prev) => {
        const next = !prev;
        saveOpenState(next);
        return next;
      });
    }
  }

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={isMobile ? onMobileClose : undefined}
      data-testid="admin-drawer"
      ModalProps={{ keepMounted: false }}
      sx={{
        width: isMobile ? 0 : open ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isMobile ? DRAWER_WIDTH_OPEN : open ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
          overflowX: "hidden",
          transition: "width 0.25s ease",
          boxSizing: "border-box",
          background: "linear-gradient(to bottom, #131D53, #1C37CB)",
          color: "#fff",
          borderRight: "none",
        },
      }}
    >
      <div className={styles.drawerInner}>
        <div className={isExpanded ? styles.topBarOpen : styles.topBarClosed}>
          <IconButton
            data-testid="admin-drawer-toggle"
            onClick={toggleDrawer}
            sx={{ color: "#fff", padding: "8px" }}
            size="small"
            aria-label={isExpanded ? "Recolher menu" : "Expandir menu"}
            aria-expanded={isExpanded}
          >
            <img src={menuIcon} alt="" className={styles.iconWhite} width={20} height={20} />
          </IconButton>
        </div>

        {isExpanded && (
          <div className={styles.userSection}>
            <Avatar
              sx={{
                bgcolor: "#fff",
                color: "#0D1B4C",
                fontFamily: "Raleway, sans-serif",
                fontWeight: 700,
                width: 56,
                height: 56,
                fontSize: "1.2rem",
                mb: 1,
              }}
            >
              {initials}
            </Avatar>
            <span className={styles.userName}>{nome}</span>
            <span className={styles.userEmail}>{email}</span>
          </div>
        )}

        {!isExpanded && (
          <div className={styles.avatarCollapsed}>
            <Tooltip title={nome} placement="right">
              <Avatar
                sx={{
                  bgcolor: "#fff",
                  color: "#0D1B4C",
                  fontFamily: "Raleway, sans-serif",
                  fontWeight: 700,
                  width: 36,
                  height: 36,
                  fontSize: "0.85rem",
                }}
              >
                {initials}
              </Avatar>
            </Tooltip>
          </div>
        )}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />

        <nav aria-label="Menu principal" className={styles.navWrapper}>
          <List disablePadding className={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
                  <Tooltip title={!isExpanded ? item.label : ""} placement="right">
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) onMobileClose?.();
                      }}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                      sx={{
                        borderRadius: "8px",
                        mx: 1,
                        mb: 0.5,
                        minHeight: 44,
                        backgroundColor: isActive ? "#fff" : "transparent",
                        "&:hover": {
                          backgroundColor: isActive ? "#fff" : "rgba(255,255,255,0.12)",
                        },
                        justifyContent: isExpanded ? "flex-start" : "center",
                        px: isExpanded ? 1.5 : 1,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: isExpanded ? 36 : "auto" }}>
                        <img
                          src={item.icon}
                          alt=""
                          width={20}
                          height={20}
                          className={isActive ? styles.iconDark : styles.iconWhite}
                        />
                      </ListItemIcon>
                      {isExpanded && (
                        <ListItemText
                          primary={item.label}
                          slotProps={{
                            primary: {
                              sx: {
                                fontSize: "0.875rem",
                                fontFamily: "Raleway, sans-serif",
                                fontWeight: isActive ? 700 : 400,
                                color: isActive ? ACTIVE_COLOR : "#fff",
                              },
                            },
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>
        </nav>

        <div className={styles.footer}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 1 }} />
          <Tooltip title={!isExpanded ? "Sair da conta" : ""} placement="right">
            <ListItemButton
              data-testid="admin-logout"
              onClick={logout}
              aria-label="Sair da conta"
              sx={{
                borderRadius: "8px",
                mx: 1,
                minHeight: 44,
                justifyContent: isExpanded ? "flex-start" : "center",
                px: isExpanded ? 1.5 : 1,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.12)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: isExpanded ? 36 : "auto" }}>
                <img
                  src={arrowExitIcon}
                  alt=""
                  width={20}
                  height={20}
                  className={styles.iconWhiteMuted}
                />
              </ListItemIcon>
              {isExpanded && (
                <ListItemText
                  primary="Sair da conta"
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: "0.875rem",
                        fontFamily: "Raleway, sans-serif",
                        color: "rgba(255,255,255,0.8)",
                      },
                    },
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </div>
      </div>
    </Drawer>
  );
}
