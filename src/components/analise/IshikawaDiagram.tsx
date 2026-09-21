import type { AnaliseField, AnaliseValues } from "../../types/analise";
import type { ChecklistState } from "./ChecklistWithDetailField";
import { buildSelectorCards, type ItemSelectorState } from "./ItemSelectorField";
import { FATORES_CONTRIBUINTES_ITEMS } from "../../constants/analiseSchema";
import styles from "./Analise.module.css";

type Props = {
  field: AnaliseField;
  values: AnaliseValues;
};

/** Um "osso" já consolidado: uma categoria do Protocolo de Londres (ou uma categoria "outro"
    digitada à mão), com os achados de TODOS os itens selecionados que marcaram essa categoria
    já juntados numa lista só de marcadores. */
type Bone = {
  key: string;
  label: string;
  bullets: string[];
};

const HEAD_GAP = 18; // precisa bater com o column-gap do grid (ver estilo inline abaixo)

/** Diagrama de Ishikawa (espinha de peixe) — UM diagrama só pro resultado final da investigação,
    juntando todos os itens selecionados na Seção 4 (eventos da cronologia + PPCs). Cada osso é uma
    categoria do Protocolo de Londres; quando mais de um item contribuiu pra mesma categoria, os
    achados de cada um entram como marcadores separados na mesma caixinha (prefixados com o nome do
    item quando há mais de um selecionado, pra manter a rastreabilidade). */
export function IshikawaDiagram({ field, values }: Props) {
  const source = field.ishikawaSource;
  if (!source) return null;

  // Campo sintético só pra reaproveitar buildSelectorCards com as mesmas fontes/rótulos da Seção 4.
  const selectorField: AnaliseField = {
    id: source.selectorFieldId,
    label: "",
    type: "item_selector",
    selectorSources: source.selectorSources,
  };
  const cards = buildSelectorCards(selectorField, values);
  const selection = (values[source.selectorFieldId] as ItemSelectorState | undefined) ?? {};
  const perItem =
    (values[source.perItemSectionId] as Record<string, Record<string, unknown>> | undefined) ?? {};

  const selectedCards = cards.filter((card) => selection[card.key]);
  const multiplosItens = selectedCards.length > 1;

  // Mapa ordenado: primeiro as 8 categorias fixas do Protocolo de Londres (nessa ordem, mesmo que
  // fiquem vazias e sejam descartadas no fim), depois qualquer categoria "outro" digitada à mão,
  // na ordem em que aparecer entre os itens selecionados.
  const bones = new Map<string, Bone>();
  for (const item of FATORES_CONTRIBUINTES_ITEMS) {
    bones.set(item.id, { key: item.id, label: item.label, bullets: [] });
  }

  for (const card of selectedCards) {
    const state = perItem[card.key]?.[source.checklistFieldId] as ChecklistState | undefined;
    if (!state) continue;

    const addBullets = (boneKey: string, label: string, achado?: string, fonte?: string) => {
      if (!achado && !fonte) return;
      const bone = bones.get(boneKey) ?? { key: boneKey, label, bullets: [] };
      const prefix = multiplosItens ? `${card.title}: ` : "";
      if (achado) bone.bullets.push(`${prefix}${achado}`);
      if (fonte) bone.bullets.push(`${prefix}Fonte: ${fonte}`);
      bones.set(boneKey, bone);
    };

    // boneKey identifica a caixinha no diagrama; porquesKey é a chave usada dentro de
    // `state.porques` — pra categorias padrão as duas são iguais (o id da categoria), mas pra
    // "outro" a caixinha é uma por texto digitado (`outro:<texto>`) enquanto os 5 Porquês desse
    // item sempre ficam salvos sob a chave fixa "outro".
    const addPorques = (boneKey: string, porquesKey: string) => {
      const rows = state.porques?.[porquesKey];
      if (!rows) return;
      const bone = bones.get(boneKey);
      if (!bone) return;
      const prefix = multiplosItens ? `${card.title}: ` : "";
      for (const row of rows) {
        const pergunta = (row.pergunta as string) || "(pergunta não preenchida)";
        const resposta = row.resposta ? ` — ${row.resposta as string}` : "";
        bone.bullets.push(`${prefix}${pergunta}${resposta}`);
      }
    };

    for (const item of FATORES_CONTRIBUINTES_ITEMS) {
      if (!state.checked[item.id]) continue;
      addBullets(
        item.id,
        item.label,
        state.details[item.id]?.["achado"],
        state.details[item.id]?.["fonte"],
      );
      addPorques(item.id, item.id);
    }

    if (state.otherChecked) {
      const label = state.otherText?.trim() || "Outro";
      const key = `outro:${label.toLowerCase()}`;
      if (!bones.has(key)) bones.set(key, { key, label, bullets: [] });
      addBullets(key, label, state.otherDetail?.["achado"], state.otherDetail?.["fonte"]);
      addPorques(key, "outro");
    }
  }

  const finalBones = [...bones.values()].filter((bone) => bone.bullets.length > 0);
  const headTitle =
    (values["incidente_investigado"] as string | undefined)?.trim() || "Resultado da investigação";

  return (
    <div className={styles.ishikawaWrap} data-testid={`field-${field.id}`}>
      {finalBones.length === 0 ? (
        <p className={styles.ishikawaEmpty}>
          Marque ao menos um fator contribuinte na Seção 4A (para algum item selecionado na Seção 4)
          para gerar o diagrama de Ishikawa (espinha de peixe) do resultado final.
        </p>
      ) : (
        <FishboneDiagram title={headTitle} bones={finalBones} />
      )}
    </div>
  );
}

/** A espinha única do resultado final — eixo central horizontal (com uma pequena cauda na ponta
    esquerda, só decorativa) terminando numa "cabeça" em forma de seta com o incidente investigado,
    e um osso diagonal por categoria com achado, alternando acima/abaixo do eixo. */
function FishboneDiagram({ title, bones }: { title: string; bones: Bone[] }) {
  const n = bones.length;
  return (
    <div className={styles.ishikawaFishboneScroll}>
      <div
        className={styles.ishikawaFishboneGrid}
        style={{
          gridTemplateColumns: `repeat(${n}, minmax(160px, max-content)) 172px`,
          gridTemplateRows: "auto 54px 4px 54px auto",
          columnGap: HEAD_GAP,
        }}
      >
        {bones.map((bone, i) => (
          <FishboneBone key={bone.key} bone={bone} col={i + 1} isTop={i % 2 === 0} />
        ))}
        <div
          className={styles.ishikawaSpineCell}
          style={{ gridColumn: `1 / span ${n}`, gridRow: 3 }}
        >
          <span className={styles.ishikawaTailTriangle} />
        </div>
        <div
          className={styles.ishikawaHeadCell}
          style={{ gridColumn: n + 1, gridRow: 3, marginLeft: -HEAD_GAP }}
        >
          <FishHead title={title} />
        </div>
      </div>
    </div>
  );
}

/** A "cabeça" do peixe: uma seta apontando pra dentro do eixo, com o incidente investigado
    centralizado. O deslocamento negativo no wrapper (ver marginLeft acima) faz a borda reta dela
    encostar exatamente na ponta do eixo, sem o respiro do gap do grid. */
function FishHead({ title }: { title: string }) {
  return (
    <div className={styles.ishikawaHeadShape}>
      <svg
        className={styles.ishikawaHeadSvg}
        viewBox="0 0 172 84"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon
          points="3,4 120,4 168,42 120,80 3,80"
          style={{ fill: "var(--color-primary-wash)", stroke: "var(--color-primary)" }}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </svg>
      <div className={styles.ishikawaHeadText}>{title}</div>
    </div>
  );
}

/** Um osso (bone) do diagrama: a caixinha com os achados já consolidados da categoria + o conector
    diagonal em SVG que liga essa caixinha ao eixo central, sempre convergindo "pra frente" (em
    direção à cabeça). */
function FishboneBone({ bone, col, isTop }: { bone: Bone; col: number; isTop: boolean }) {
  const boxRow = isTop ? 1 : 5;
  const connectorRow = isTop ? 2 : 4;

  return (
    <>
      <div className={styles.ishikawaBoneBox} style={{ gridColumn: col, gridRow: boxRow }}>
        <div className={styles.ishikawaBoneLabel}>{bone.label}</div>
        <ul className={styles.ishikawaBoneList}>
          {bone.bullets.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </div>
      <div
        className={styles.ishikawaConnectorCell}
        style={{ gridColumn: col, gridRow: connectorRow }}
      >
        <svg
          className={styles.ishikawaConnectorSvg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1={4}
            y1={isTop ? 0 : 100}
            x2={96}
            y2={isTop ? 100 : 0}
            style={{ stroke: "var(--color-primary)" }}
            strokeWidth={4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </>
  );
}
