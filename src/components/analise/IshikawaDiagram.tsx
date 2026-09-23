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
  /** Uma entrada por item em análise que marcou a categoria: o achado + os 5 Porquês dele. */
  entradas: BoneEntry[];
};

type BoneEntry = {
  /** Nome do item (ex.: "Evento 1: ") — só quando há mais de um item selecionado. */
  prefixo: string;
  achado?: string;
  /** Níveis do 5 Porquês ("Por que …? — resposta"), exibidos menores, abaixo do achado. */
  porques: string[];
};

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
    bones.set(item.id, { key: item.id, label: item.label, entradas: [] });
  }

  for (const card of selectedCards) {
    const state = perItem[card.key]?.[source.checklistFieldId] as ChecklistState | undefined;
    if (!state) continue;

    const prefixo = multiplosItens ? `${card.title}: ` : "";

    // boneKey identifica a caixinha no diagrama; porquesKey é a chave usada dentro de
    // `state.porques` — pra categorias padrão as duas são iguais (o id da categoria), mas pra
    // "outro" a caixinha é uma por texto digitado (`outro:<texto>`) enquanto os 5 Porquês desse
    // item sempre ficam salvos sob a chave fixa "outro". A fonte/evidência não entra no diagrama.
    const addEntrada = (boneKey: string, label: string, porquesKey: string, achado?: string) => {
      const porques = (state.porques?.[porquesKey] ?? [])
        .filter((row) => row.pergunta || row.resposta)
        .map((row) => {
          const pergunta = (row.pergunta as string) || "(pergunta não preenchida)";
          return row.resposta ? `${pergunta} — ${row.resposta as string}` : pergunta;
        });
      if (!achado?.trim() && porques.length === 0) return;
      const bone = bones.get(boneKey) ?? { key: boneKey, label, entradas: [] };
      bone.entradas.push({ prefixo, achado: achado?.trim(), porques });
      bones.set(boneKey, bone);
    };

    for (const item of FATORES_CONTRIBUINTES_ITEMS) {
      if (!state.checked[item.id]) continue;
      addEntrada(item.id, item.label, item.id, state.details[item.id]?.["achado"]);
    }

    if (state.otherChecked) {
      const label = state.otherText?.trim() || "Outro";
      const key = `outro:${label.toLowerCase()}`;
      addEntrada(key, label, "outro", state.otherDetail?.["achado"]);
    }
  }

  const finalBones = [...bones.values()].filter((bone) => bone.entradas.length > 0);
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
          gridTemplateColumns: `repeat(${cols}, 200px) auto`,
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
        <ul className={styles.ishikawaBoneList}>
          {bone.entradas.map((e, i) => (
            <li key={i}>
              {e.achado ? `${e.prefixo}${e.achado}` : e.prefixo.replace(/: $/, "")}
              {e.porques.length > 0 && (
                <ul className={styles.ishikawaBonePorques}>
                  {e.porques.map((texto, j) => (
                    <li key={j}>{texto}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
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
