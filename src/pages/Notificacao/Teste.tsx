import styles from "./Teste.module.css";
import { MultiSelect } from "../../components/form/MultiSelect";
import { DateInput } from "../../components/form/DateInput";

export default function Teste() {
  return (
    <div className={styles.container}>
      <h1>Registrar Incidente</h1>

      <form className={styles.form}>
        <input type="text" placeholder="Título do incidente" />

        <textarea placeholder="Descreva o incidente" />

        <MultiSelect
          label="Onde aconteceu?"
          options={[
            "Hospital fulano",
            "Centro medico beltrano",
            "Hospital cicrano",
          ]}
        />

        <DateInput label="Data do incidente" />

        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}