import { useState } from "react";
import { FiArrowRight, FiInfo } from "react-icons/fi";
import { Button } from "../common/ui/Button";
import stepStyles from "../form/StepForm/StepForm.module.css";
import styles from "./Analise.module.css";

/** Preferência "Não mostrar novamente" — guardada no navegador, vale para todas as análises. */
export const GUIA_INVESTIGACAO_OCULTO_KEY = "analise-guia-investigacao-oculto";

export function guiaInvestigacaoOculto() {
  try {
    return localStorage.getItem(GUIA_INVESTIGACAO_OCULTO_KEY) === "true";
  } catch {
    return false;
  }
}

type Etapa = {
  badge: string;
  titulo: string;
  descricao: string;
  proximoPasso?: boolean;
};

const ETAPAS: Etapa[] = [
  {
    badge: "Seção 1",
    titulo: "Dados gerais",
    descricao: "Confira as informações do incidente e defina claramente o que será investigado.",
  },
  {
    badge: "Seção 2",
    titulo: "Entendimento inicial",
    descricao:
      "Registre os participantes da análise, as fontes consultadas e, quando necessário, as entrevistas realizadas.",
  },
  {
    badge: "Seção 3",
    titulo: "Cronologia e PPC",
    descricao:
      "Organize os fatos em ordem e identifique os Problemas na Prestação do Cuidado (PPC).",
  },
  {
    badge: "Seção 4",
    titulo: "Fatores contribuintes",
    descricao:
      "Para cada PPC, identifique as condições que contribuíram para sua ocorrência. Se necessário, aprofunde um fator com os 5 Porquês.",
  },
  {
    badge: "Seção 5",
    titulo: "Resultado da análise",
    descricao:
      "Revise os fatores identificados no Diagrama de Ishikawa e registre as recomendações de melhoria.",
  },
  {
    badge: "Próximo passo",
    titulo: "Plano de Ação",
    descricao:
      "Transforme as recomendações em ações, definindo responsáveis, prazos e acompanhamento.",
    proximoPasso: true,
  },
];

type Props = {
  onComecar: () => void;
};

/**
 * Tela de apresentação exibida antes da Seção 1 da análise — não é uma seção do formulário (não
 * entra na barra de progresso nem na validação), só mostra o percurso completo da investigação.
 */
export function GuiaInvestigacao({ onComecar }: Props) {
  const [naoMostrar, setNaoMostrar] = useState(false);

  function handleComecar() {
    try {
      if (naoMostrar) localStorage.setItem(GUIA_INVESTIGACAO_OCULTO_KEY, "true");
    } catch {
      // preferência é best-effort no protótipo
    }
    onComecar();
  }

  return (
    <div className={styles.guia} data-testid="analise-guia">
      <h2 className={styles.guiaTitulo}>Guia de investigação</h2>
      <p className={styles.guiaIntro}>
        Nesta investigação, você irá reconstruir o que aconteceu, identificar os problemas na
        prestação do cuidado e entender os fatores que contribuíram para o incidente, com o objetivo
        de aprender com o que aconteceu e fortalecer a segurança do cuidado.
      </p>

      <div className={styles.guiaAviso} role="note">
        <span className={styles.guiaAvisoIcon} aria-hidden="true">
          <FiInfo size={16} />
        </span>
        <div className={styles.guiaAvisoTexto}>
          <p>
            O percurso da investigação é o mesmo, mas a equipe pode realizá-lo de forma mais rápida
            ou de maneira completa e detalhada. Para essa decisão, considere a gravidade das
            possíveis consequências, a probabilidade de repetição do evento e o potencial de
            aprendizagem do incidente.
          </p>
          <p>
            Mesmo sem dano grave, o incidente pode exigir maior aprofundamento quando revelar falhas
            importantes do processo, risco de recorrência ou oportunidade relevante de melhoria.
          </p>
          <p>
            Nesta investigação, o sistema utiliza as categorias de fatores contribuintes do{" "}
            <strong>Protocolo de Londres 2024</strong>. Durante a análise, quando necessário, os
            fatores identificados podem ser aprofundados com os <strong>5 Porquês</strong>. Ao
            final, os resultados são apresentados no <strong>Diagrama de Ishikawa</strong>.
          </p>
        </div>
      </div>

      <h3 className={styles.guiaSubtitulo}>Seu caminho na análise</h3>
      <ol className={styles.guiaEtapas}>
        {ETAPAS.map((etapa, i) => (
          <li
            key={etapa.titulo}
            className={[styles.guiaEtapa, etapa.proximoPasso ? styles.guiaEtapaProximo : ""]
              .join(" ")
              .trim()}
          >
            <span className={styles.guiaEtapaNumero}>{i + 1}</span>
            <div className={styles.guiaEtapaCard}>
              <span className={styles.guiaEtapaBadge}>{etapa.badge}</span>
              <span className={styles.guiaEtapaTitulo}>{etapa.titulo}</span>
              <span className={styles.guiaEtapaDescricao}>{etapa.descricao}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.guiaRodape}>
        <label className={styles.guiaNaoMostrar}>
          <input
            type="checkbox"
            checked={naoMostrar}
            onChange={(e) => setNaoMostrar(e.target.checked)}
            data-testid="analise-guia-nao-mostrar"
          />
          Não mostrar novamente
        </label>
        <Button
          title="Começar a análise"
          variant="contained"
          color="primary"
          endIcon={<FiArrowRight size={15} style={{ marginLeft: 8 }} />}
          onClick={handleComecar}
          className={stepStyles.compactBtn}
          data-testid="analise-guia-comecar"
        />
      </div>
    </div>
  );
}
