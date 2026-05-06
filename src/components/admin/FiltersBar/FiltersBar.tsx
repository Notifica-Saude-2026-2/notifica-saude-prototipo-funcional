import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import styles from "./FiltersBar.module.css";

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9e9e9e"
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

const SORT_OPTIONS = [
  { value: "recent", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "damage_asc", label: "Menor grau de dano" },
  { value: "damage_desc", label: "Maior grau de dano" },
];

export function FiltersBar() {
  return (
    <div className={styles.bar}>
      <OutlinedInput
        data-testid="admin-search"
        placeholder="Buscar por ID, setor, responsável ou Grau de dano"
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
        <FormControl size="small">
          <Select
            inputProps={{ "data-testid": "admin-sort" }}
            defaultValue="recent"
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
              minWidth: 160,
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
  );
}
