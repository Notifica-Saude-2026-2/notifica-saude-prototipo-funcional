import styles from "./MultiSelect.module.css";

type Props = {
  label: string;
  options: string[];
};

export function MultiSelect({ label, options }: Props) {
  return (
    <div className={styles.container}>
      <label>{label}</label>
      <select multiple className={styles.select}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}