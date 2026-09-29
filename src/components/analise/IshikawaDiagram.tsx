import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { FiDownload } from "react-icons/fi";
import type { AnaliseField, AnaliseValues } from "../../types/analise";
import { Button } from "../common/ui/Button";
import stepStyles from "../form/StepForm/StepForm.module.css";
import type { ChecklistState } from "./ChecklistWithDetailField";
import { buildSelectorCards, type ItemSelectorState } from "./ItemSelectorField";
import { FATORES_CONTRIBUINTES_ITEMS } from "../../constants/analiseSchema";
import styles from "./Analise.module.css";

type Props = {
  field: AnaliseField;
  values: AnaliseValues;
};

/** Um "osso" já consolidado: uma das 8 categorias de fatores contribuintes, com os fatores
    registrados nela agrupados pelo PPC a que se referem. */
type Bone = {
  key: string;
  label: string;
  grupos: BoneGrupo[];
};

type BoneGrupo = {
  /** Texto do PPC ("Descreva o problema…"), exibido como etiqueta acima dos fatores dele. */
  ppc: string;
  fatores: BoneFator[];
};

type BoneFator = {
  /** Texto do fator, como a pessoa escreveu. */
  achado: string;
  /** Só as respostas do 5 Porquês, na ordem, exibidas abaixo do fator. */
  respostas: string[];
};

/** Diagrama de Ishikawa (espinha de peixe) — UM diagrama só pro resultado final da investigação,
    juntando os fatores de todos os PPCs da Seção 4. Cada osso é uma categoria; dentro dela, os
    fatores ficam agrupados sob o PPC ao qual se relacionam (um mesmo tipo de fator ligado a dois
    PPCs aparece sob cada um deles). Do 5 Porquês entram só as respostas. */
export function IshikawaDiagram({ field, values }: Props) {
  const diagramaRef = useRef<HTMLDivElement>(null);
  const [exportando, setExportando] = useState(false);
  const source = field.ishikawaSource;
  if (!source) return null;

  /** Baixa o diagrama inteiro como PNG — inclusive a parte fora da área visível (a espinha rola
      na horizontal), por isso captura com a largura total e sem a rolagem. */
  async function exportarPng() {
    const alvo = diagramaRef.current?.firstElementChild as HTMLElement | null;
    if (!alvo) return;
    setExportando(true);
    try {
      const url = await toPng(alvo, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: alvo.scrollWidth,
        height: alvo.scrollHeight,
        style: { overflow: "visible" },
      });
      const link = document.createElement("a");
      link.download = "diagrama-ishikawa.png";
      link.href = url;
      link.click();
    } catch {
      window.alert("Não foi possível exportar o diagrama. Tente novamente.");
    } finally {
      setExportando(false);
    }
  }

  // Campo sintético só pra reaproveitar buildSelectorCards com as mesmas fontes/rótulos da Seção 4.
  const selectorField: AnaliseField = {
    id: source.selectorFieldId ?? "",
    label: "",
    type: "item_selector",
    selectorSources: source.selectorSources,
  };
  const cards = buildSelectorCards(selectorField, values);
  const selection = source.selectorFieldId
    ? ((values[source.selectorFieldId] as ItemSelectorState | undefined) ?? {})
    : null;
  const perItem =
    (values[source.perItemSectionId] as Record<string, Record<string, unknown>> | undefined) ?? {};

  const selectedCards = selection ? cards.filter((card) => selection[card.key]) : cards;

  // As 8 categorias sempre na mesma ordem; as vazias são descartadas no fim.
  const bones = new Map<string, Bone>();
  for (const item of FATORES_CONTRIBUINTES_ITEMS) {
    bones.set(item.id, { key: item.id, label: item.label, grupos: [] });
  }

  for (const card of selectedCards) {
    const state = (
      source.checklistFieldId ? perItem[card.key]?.[source.checklistFieldId] : perItem[card.key]
    ) as ChecklistState | undefined;
    if (!state) continue;

    for (const item of FATORES_CONTRIBUINTES_ITEMS) {
      if (!state.checked[item.id]) continue;
      const achado = state.details[item.id]?.["achado"]?.trim();
      if (!achado) continue;
      const respostas = (state.porques?.[item.id] ?? [])
        .map((row) => (row.resposta ?? "").trim())
        .filter(Boolean);
      bones.get(item.id)!.grupos.push({
        ppc: card.text || card.title,
        fatores: [{ achado, respostas }],
      });
    }
  }

  const finalBones = [...bones.values()].filter((bone) => bone.grupos.length > 0);
  const headTitle =
    (values["incidente_investigado"] as string | undefined)?.trim() || "Resultado da investigação";

  return (
    <div className={styles.ishikawaWrap} data-testid={`field-${field.id}`}>
      {finalBones.length === 0 ? (
        <p className={styles.ishikawaEmpty}>
          Registre ao menos um fator contribuinte na Seção 4 para gerar o diagrama de Ishikawa
          (espinha de peixe) do resultado final.
        </p>
      ) : (
        <>
          <div className={styles.ishikawaToolbar}>
            <Button
              title={exportando ? "Exportando..." : "Exportar diagrama"}
              variant="outlined"
              color="primary"
              startIcon={<FiDownload size={15} style={{ marginRight: 6 }} />}
              onClick={exportarPng}
              disabled={exportando}
              className={`${stepStyles.compactBtn} ${styles.ishikawaExportBtn}`}
              data-testid="analise-exportar-diagrama"
            />
          </div>
          <div ref={diagramaRef}>
            <FishboneDiagram title={headTitle} bones={finalBones} />
          </div>
        </>
      )}
    </div>
  );
}

/** A espinha de peixe do resultado final — layout propositalmente simples (grid CSS, sem cálculo
    de coordenadas), pra não quebrar com textos longos ou muitas categorias:
    - cada coluna tem até 2 categorias: uma acima do eixo e outra abaixo, e os ossos das duas se
      encontram no mesmo ponto do eixo;
    - as categorias são só texto (título + marcadores), sem caixa — o texto cresce livremente;
    - cauda (nadadeira preenchida) à esquerda e cabeça preenchida com o incidente à direita. */
function FishboneDiagram({ title, bones }: { title: string; bones: Bone[] }) {
  const cols = Math.ceil(bones.length / 2);
  return (
    <div className={styles.ishikawaFishboneScroll}>
      <div
        className={styles.ishikawaFishboneGrid}
        style={{
          gridTemplateColumns: `repeat(${cols}, 240px) auto`,
          gridTemplateRows: "auto 48px 6px 48px auto",
        }}
      >
        {bones.map((bone, i) => (
          <FishboneBone
            key={bone.key}
            bone={bone}
            col={Math.floor(i / 2) + 1}
            isTop={i % 2 === 0}
          />
        ))}
        <div
          className={styles.ishikawaSpineCell}
          style={{ gridColumn: `1 / span ${cols}`, gridRow: 3 }}
        >
          <FishTail />
        </div>
        <div
          className={styles.ishikawaHeadCell}
          style={{ gridColumn: cols + 1, gridRow: "2 / span 3" }}
        >
          <FishHead title={title} />
        </div>
      </div>
    </div>
  );
}

/** Cauda: nadadeira em meia-lua, preenchida, encaixada na ponta esquerda do eixo. */
function FishTail() {
  return (
    <svg className={styles.ishikawaTailSvg} viewBox="0 0 60 110" aria-hidden="true">
      <path d="M 60,55 C 42,30 22,10 4,2 C 20,32 20,78 4,108 C 22,100 42,80 60,55 Z" />
    </svg>
  );
}

/** Cabeça: forma preenchida com o incidente investigado em branco. O SVG estica na vertical
    conforme o texto (até 100 caracteres), então a forma continua fechando o texto. */
function FishHead({ title }: { title: string }) {
  return (
    <div className={styles.ishikawaHeadShape}>
      <svg
        className={styles.ishikawaHeadSvg}
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M 2,2 C 110,0 172,14 198,50 C 172,86 110,100 2,98 Q 14,50 2,2 Z" />
      </svg>
      <div className={styles.ishikawaHeadText}>{title}</div>
    </div>
  );
}

/** Uma categoria: texto (título + achados + 5 Porquês) acima ou abaixo do eixo, e o osso — uma
    linha diagonal que sai do texto e chega no eixo, inclinada "pra frente" (em direção à cabeça). */
function FishboneBone({ bone, col, isTop }: { bone: Bone; col: number; isTop: boolean }) {
  return (
    <>
      <div
        className={`${styles.ishikawaBoneText} ${isTop ? styles.ishikawaBoneTextTop : ""}`}
        style={{ gridColumn: col, gridRow: isTop ? 1 : 5 }}
      >
        <div className={styles.ishikawaBoneLabel}>{bone.label}</div>
        {bone.grupos.map((grupo, i) => (
          <div key={i} className={styles.ishikawaGrupo}>
            <div className={styles.ishikawaPpc}>{grupo.ppc}</div>
            <ul className={styles.ishikawaBoneList}>
              {grupo.fatores.map((fator, j) => (
                <li key={j}>
                  {fator.achado}
                  {fator.respostas.length > 0 && (
                    <ul className={styles.ishikawaBonePorques}>
                      {fator.respostas.map((texto, k) => (
                        <li key={k}>{texto}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className={styles.ishikawaConnectorCell}
        style={{ gridColumn: col, gridRow: isTop ? 2 : 4 }}
      >
        <svg
          className={styles.ishikawaConnectorSvg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1={30}
            y1={isTop ? 0 : 100}
            x2={100}
            y2={isTop ? 100 : 0}
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </>
  );
}
