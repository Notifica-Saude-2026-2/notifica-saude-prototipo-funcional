import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import styles from "./FiltersBar.module.css";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Todos incidentes",
  "/admin/novos": "Novos incidentes",
  "/admin/encaminhados": "Encaminhados",
  "/admin/resolvidos": "Arquivados",
};

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b6375"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const TIPO_INCIDENTE_OPTIONS = [
  { value: "", label: "Todos os tipos" },
  { value: "NEAR_MISS", label: "Near Miss" },
  { value: "CIRCUNSTANCIA_NOTIFICAVEL", label: "Circunstância notificável" },
  { value: "INCIDENTE_SEM_DANO", label: "Incidente sem dano" },
  { value: "EVENTO_ADVERSO", label: "Evento adverso" },
];

const GRAU_DANO_OPTIONS = [
  { value: "", label: "Todos os graus" },
  { value: "LEVE", label: "Leve" },
  { value: "MODERADO", label: "Moderado" },
  { value: "GRAVE", label: "Grave" },
  { value: "OBITO", label: "Óbito" },
  { value: "NEVER_EVENT", label: "Never Event" },
];

const SORT_OPTIONS = [
  { value: "recente", label: "Mais recentes" },
  { value: "antigo", label: "Mais antigos" },
];

type FiltersBarProps = {
  search: string;
  sort: "recente" | "antigo";
  tipoIncidente: string;
  grauDano: string;
  setorId: string;
  setores: { id: string; valor: string }[];
  onSearchChange: (v: string) => void;
  onSortChange: (v: "recente" | "antigo") => void;
  onTipoIncidenteChange: (v: string) => void;
  onGrauDanoChange: (v: string) => void;
  onSetorChange: (v: string) => void;
};

export function FiltersBar({
  search,
  sort,
  tipoIncidente,
  grauDano,
  setorId,
  setores,
  onSearchChange,
  onSortChange,
  onTipoIncidenteChange,
  onGrauDanoChange,
  onSetorChange,
}: FiltersBarProps) {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Incidentes";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <>
    <div className={styles.titleWrapper}>
      <h2 className={styles.pageTitle}>{pageTitle}</h2>
    </div>
    <div className={styles.bar}>
      <OutlinedInput
        data-testid="admin-search"
        placeholder="Buscar por identificador"
        defaultValue={search}
        onChange={handleSearchInput}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
        sx={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontFamily: "Inter, sans-serif",
          "& fieldset": { borderColor: "#e5e4e7" },
          "&:hover fieldset": { borderColor: "#183EFF" },
        }}
        size="small"
      />

      <div className={styles.filterRight}>
        <span className={styles.filterLabel}>FILTRAR POR:</span>

        <FormControl size="small" sx={{ flex: { xs: 1, sm: "none" }, minWidth: 0 }}>
          <Select
            inputProps={{ "data-testid": "admin-tipo-incidente" }}
            value={tipoIncidente}
            onChange={(e) => onTipoIncidenteChange(e.target.value)}
            displayEmpty
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
              width: "100%",
              minWidth: { xs: 0, sm: 200 },
              "& fieldset": { borderColor: "#e5e4e7" },
            }}
          >
            {TIPO_INCIDENTE_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.value}
                value={opt.value}
                sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem" }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {tipoIncidente === "EVENTO_ADVERSO" && (
          <FormControl size="small" sx={{ flex: { xs: 1, sm: "none" }, minWidth: 0 }}>
            <Select
              inputProps={{ "data-testid": "admin-grau-dano" }}
              value={grauDano}
              onChange={(e) => onGrauDanoChange(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
                width: "100%",
                minWidth: { xs: 0, sm: 160 },
                "& fieldset": { borderColor: "#e5e4e7" },
              }}
            >
              {GRAU_DANO_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  value={opt.value}
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem" }}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl size="small" sx={{ flex: { xs: 1, sm: "none" }, minWidth: 0 }}>
          <Select
            inputProps={{ "data-testid": "admin-setor" }}
            value={setorId}
            onChange={(e) => onSetorChange(e.target.value)}
            displayEmpty
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
              width: "100%",
              minWidth: { xs: 0, sm: 180 },
              "& fieldset": { borderColor: "#e5e4e7" },
            }}
          >
            <MenuItem value="" sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem" }}>
              Todos os setores
            </MenuItem>
            {setores.map((s) => (
              <MenuItem
                key={s.id}
                value={s.id}
                sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem" }}
              >
                {s.valor}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <span className={styles.filterLabel}>ORDENAR POR:</span>
        <FormControl size="small" sx={{ flex: { xs: 1, sm: "none" }, minWidth: 0 }}>
          <Select
            inputProps={{ "data-testid": "admin-sort" }}
            value={sort}
            onChange={(e) => onSortChange(e.target.value as "recente" | "antigo")}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
              width: "100%",
              minWidth: { xs: 0, sm: 160 },
              "& fieldset": { borderColor: "#e5e4e7" },
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.value}
                value={opt.value}
                sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem" }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
    </>
  );
}
