import type { AnaliseField } from "../../types/analise";
import type { ChecklistState } from "./ChecklistWithDetailField";
import styles from "./Analise.module.css";

type Props = {
  field: AnaliseField;
  sourceField: AnaliseField | undefined;
  sourceValue: ChecklistState | undefined;
};

/** Visualização simplificada (mockada) do diagrama de Ishikawa a partir do checklist de fatores contribuintes. */
export function IshikawaDiagram({ field, sourceField, sourceValue }: Props) {
  const items = sourceField?.items ?? [];
  const state = sourceValue;
  const spines = items
    .filter((item) => state?.checked[item.id])
    .map((item) => ({
      label: item.label,
      achado: state?.details[item.id]?.["achado"],
      fonte: state?.details[item.id]?.["fonte"],
    }));
  if (state?.otherChecked) {
    spines.push({
      label: state.otherText || "Outro",
      achado: state.otherDetail?.["achado"],
      fonte: state.otherDetail?.["fonte"],
    });
  }

  return (
    <div className={styles.ishikawaWrap} data-testid={`field-${field.id}`}>
      {spines.length === 0 ? (
        <p className={styles.ishikawaEmpty}>
          Marque ao menos um fator contribuinte acima para gerar o diagrama de Ishikawa (espinha de
          peixe).
        </p>
      ) : (
        spines.map((spine, i) => (
          <div key={i} className={styles.ishikawaSpine}>
            <div className={styles.ishikawaSpineTitle}>{spine.label}</div>
            {spine.achado && <p className={styles.ishikawaFinding}>{spine.achado}</p>}
            {spine.fonte && <p className={styles.ishikawaFinding}>Fonte: {spine.fonte}</p>}
          </div>
        ))
      )}
    </div>
  );
}
