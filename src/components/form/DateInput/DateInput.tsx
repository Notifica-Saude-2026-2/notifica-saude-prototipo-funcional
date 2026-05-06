import styles from "./DateInput.module.css";

type Props = {
  label: string;
};

export function DateInput({ label }: Props) {
  return (
    <div className={styles.container}>
      <label>{label}</label>
      <input type="date" className={styles.input} />
    </div>
  );
}
