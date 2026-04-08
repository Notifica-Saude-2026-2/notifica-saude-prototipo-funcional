import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BsChatSquareTextFill, BsCheckCircle } from "react-icons/bs";
import { FaUser, FaMapMarkerAlt, FaClipboardList } from "react-icons/fa";
import { Button } from "../../components/common/ui/Button";
import { StepForm } from "../../components/form/StepForm";
import { RadioGroup } from "../../components/form/RadioGroup";
import { Input } from "../../components/common/ui/Input";
import styles from "./Notificacao.module.css";

type Screen = "tela1" | "tela2" | "tela3" | "tela4";

type FormData = {
  instituicao: string;
  envolvePackiente: string;
  idade: string;
  sexo: string;
  sexoOutro: string;
  dataIncidente: string;
  turno: string;
  setor: string;
  setorOutro: string;
  descricao: string;
  papel: string;
  papelOutro: string;
  nomeNotificador: string;
  contatoNotificador: string;
};

const initialFormData: FormData = {
  instituicao: "",
  envolvePackiente: "",
  idade: "",
  sexo: "",
  sexoOutro: "",
  dataIncidente: "",
  turno: "",
  setor: "",
  setorOutro: "",
  descricao: "",
  papel: "",
  papelOutro: "",
  nomeNotificador: "",
  contatoNotificador: "",
};

function getDisplayStep(screen: Screen, envolvePackiente: string): number {
  if (screen === "tela1") return 1;
  if (screen === "tela2") return 2;
  if (screen === "tela3") return envolvePackiente === "sim" ? 3 : 2;
  return envolvePackiente === "sim" ? 4 : 3;
}

function getTotalSteps(envolvePackiente: string): number {
  return envolvePackiente === "sim" ? 4 : 3;
}

export default function Notificacao() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("tela1");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const set = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalSteps = getTotalSteps(formData.envolvePackiente);
  const currentStep = getDisplayStep(screen, formData.envolvePackiente);

  const canAdvanceTela1 =
    formData.instituicao !== "" && formData.envolvePackiente !== "";
  const canAdvanceTela2 =
    formData.idade !== "" &&
    formData.sexo !== "" &&
    (formData.sexo !== "outro" || formData.sexoOutro.trim() !== "");
  const today = new Date().toISOString().split("T")[0];
  const canAdvanceTela3 =
    formData.dataIncidente !== "" &&
    formData.dataIncidente <= today &&
    formData.turno !== "" &&
    formData.setor !== "" &&
    (formData.setor !== "outro" || formData.setorOutro.trim() !== "");
  const canAdvanceTela4 =
    formData.descricao.trim() !== "" &&
    formData.papel !== "" &&
    (formData.papel !== "outro" || formData.papelOutro.trim() !== "");

  function handleNext() {
    if (screen === "tela1") {
      setScreen(formData.envolvePackiente === "sim" ? "tela2" : "tela3");
    } else if (screen === "tela2") {
      setScreen("tela3");
    } else if (screen === "tela3") {
      setScreen("tela4");
    } else {
      setSubmitted(true);
    }
  }

  function handlePrev() {
    if (screen === "tela4") {
      setScreen("tela3");
    } else if (screen === "tela3") {
      setScreen(formData.envolvePackiente === "sim" ? "tela2" : "tela1");
    } else if (screen === "tela2") {
      setScreen("tela1");
    }
  }

  if (submitted) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.successCard}>
          <BsCheckCircle className={styles.successIcon} />
          <h2 className={styles.successTitle}>Notificação enviada com sucesso!</h2>
          <p className={styles.successText}>
            Agradecemos o tempo dedicado para registrar o incidente. Sua contribuição
            é muito importante para melhorar a segurança do paciente.
          </p>
          <div className={styles.successActions}>
            <Button
              title="Voltar ao início"
              variant="outlined"
              color="gray"
              onClick={() => navigate("/")}
            />
            <Button
              title="Nova notificação"
              variant="contained"
              color="primary"
              onClick={() => {
                setFormData(initialFormData);
                setScreen("tela1");
                setSubmitted(false);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>REGISTRO DE INCIDENTE</h1>
        <p className={styles.pageSubtitle}>
          Formulário para notificação de incidentes de segurança do paciente
        </p>
      </div>

      {screen === "tela1" && (
        <StepForm
          currentStep={currentStep}
          totalSteps={totalSteps || 3}
          stepTitle="Informações iniciais"
          stepIcon={<BsChatSquareTextFill />}
          onNext={handleNext}
          canAdvance={canAdvanceTela1}
        >
          <RadioGroup
            name="instituicao"
            label="Selecione a instituição de Saúde onde ocorreu o incidente"
            required
            scrollable
            value={formData.instituicao}
            onChange={(v) => set("instituicao", v)}
            options={[
              {
                value: "humap",
                label: "Hospital Universitário Maria Aparecida Pedrossian – HUMAP",
              },
              {
                value: "hrms",
                label: "Hospital Regional de Mato Grosso do Sul",
              },
              {
                value: "santacasa",
                label: "Hospital Santa Casa de Campo Grande de Mato Grosso do Sul",
              },
            ]}
          />

          <RadioGroup
            name="envolvePackiente"
            label="O incidente envolve paciente?"
            required
            value={formData.envolvePackiente}
            onChange={(v) => {
              set("envolvePackiente", v);
              if (v === "nao") {
                set("idade", "");
                set("sexo", "");
                set("sexoOutro", "");
              }
            }}
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
            ]}
          />
        </StepForm>
      )}

      {screen === "tela2" && (
        <StepForm
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle="Informações do paciente"
          stepIcon={<FaUser />}
          onNext={handleNext}
          onPrev={handlePrev}
          canAdvance={canAdvanceTela2}
        >
          <RadioGroup
            name="idade"
            label="Idade"
            required
            value={formData.idade}
            onChange={(v) => set("idade", v)}
            options={[
              { value: "recem-nascido", label: "Recém-nascido" },
              { value: "0-1", label: "0–1 ano" },
              { value: "2-12", label: "2–12 anos" },
              { value: "13-17", label: "13–17 anos" },
              { value: "18-59", label: "18–59 anos" },
              { value: "60+", label: "60 anos ou mais" },
              { value: "nao-sei", label: "Não sei informar" },
            ]}
          />

          <div className={styles.fieldGroup}>
            <RadioGroup
              name="sexo"
              label="Sexo"
              required
              value={formData.sexo}
              onChange={(v) => {
                set("sexo", v);
                if (v !== "outro") set("sexoOutro", "");
              }}
              options={[
                { value: "feminino", label: "Feminino" },
                { value: "masculino", label: "Masculino" },
                { value: "outro", label: "Outro" },
                { value: "nao-sei", label: "Não sei informar" },
              ]}
            />
            {formData.sexo === "outro" && (
              <div className={styles.outroInput}>
                <Input
                  label="Especifique"
                  value={formData.sexoOutro}
                  onChange={(e) => set("sexoOutro", e.target.value)}
                  placeholder="Informe o sexo"
                  fullWidth
                />
              </div>
            )}
          </div>
        </StepForm>
      )}

      {screen === "tela3" && (
        <StepForm
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle="Momento e local do incidente"
          stepIcon={<FaMapMarkerAlt />}
          onNext={handleNext}
          onPrev={handlePrev}
          canAdvance={canAdvanceTela3}
        >
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Em que data ocorreu o incidente?
              <span className={styles.asterisk}>*</span>
            </label>
            <span className={styles.requiredHint}>*Preenchimento obrigatório</span>
            <input
              type="date"
              className={styles.dateInput}
              value={formData.dataIncidente}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => set("dataIncidente", e.target.value)}
            />
            {formData.dataIncidente !== "" && formData.dataIncidente > today && (
              <span className={styles.dateError}>Data inválida</span>
            )}
          </div>

          <RadioGroup
            name="turno"
            label="Em qual turno ocorreu o incidente?"
            required
            value={formData.turno}
            onChange={(v) => set("turno", v)}
            options={[
              { value: "manha", label: "Manhã (07h–13h)" },
              { value: "tarde", label: "Tarde (13h–19h)" },
              { value: "noite", label: "Noite (19h–07h)" },
              { value: "nao-sei", label: "Não sei informar" },
            ]}
          />

          <div className={styles.fieldGroup}>
            <RadioGroup
              name="setor"
              label="Em qual setor ocorreu o incidente?"
              required
              value={formData.setor}
              onChange={(v) => {
                set("setor", v);
                if (v !== "outro") set("setorOutro", "");
              }}
              options={[
                { value: "clinica-medica-adulto", label: "Clínica Médica Adulto" },
                { value: "clinica-cirurgica-adulto", label: "Clínica Cirúrgica Adulto" },
                { value: "clinica-medica-ped", label: "Clínica Médica Pediátrica" },
                { value: "clinica-cirurgica-ped", label: "Clínica Cirúrgica Pediátrica" },
                { value: "uti", label: "UTI" },
                { value: "centro-cirurgico", label: "Centro cirúrgico" },
                { value: "pronto-atendimento", label: "Pronto atendimento / emergência" },
                { value: "ambulatorio", label: "Ambulatório" },
                { value: "farmacia", label: "Farmácia" },
                { value: "diagnostico-imagem", label: "Diagnóstico por imagem" },
                { value: "laboratorio", label: "Laboratório" },
                { value: "outro", label: "Outro" },
              ]}
            />
            {formData.setor === "outro" && (
              <div className={styles.outroInput}>
                <Input
                  label="Especifique o setor"
                  value={formData.setorOutro}
                  onChange={(e) => set("setorOutro", e.target.value)}
                  placeholder="Informe o setor"
                  fullWidth
                />
              </div>
            )}
          </div>
        </StepForm>
      )}

      {screen === "tela4" && (
        <StepForm
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle="Descrição e notificador"
          stepIcon={<FaClipboardList />}
          onNext={handleNext}
          onPrev={handlePrev}
          isLastStep
          canAdvance={canAdvanceTela4}
        >
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Descreva o que aconteceu
              <span className={styles.asterisk}>*</span>
            </label>
            <span className={styles.requiredHint}>*Preenchimento obrigatório</span>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={formData.descricao}
              onChange={(e) => {
                set("descricao", e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Descreva brevemente o incidente..."
              rows={3}
            />
          </div>

          <div className={styles.fieldGroup}>
            <RadioGroup
              name="papel"
              label="Informe o seu papel na instituição"
              required
              value={formData.papel}
              onChange={(v) => {
                set("papel", v);
                if (v !== "outro") set("papelOutro", "");
              }}
              options={[
                { value: "enfermeiro", label: "Enfermeiro" },
                { value: "medico", label: "Médico" },
                { value: "tecnico-enfermagem", label: "Técnico de enfermagem" },
                { value: "farmaceutico", label: "Farmacêutico" },
                { value: "fisioterapeuta", label: "Fisioterapeuta" },
                { value: "residente", label: "Residente" },
                { value: "estagiario", label: "Estagiário" },
                { value: "gestor", label: "Gestor" },
                { value: "paciente", label: "Paciente" },
                { value: "familiar", label: "Familiar / acompanhante" },
                { value: "outro", label: "Outro" },
                { value: "prefiro-nao", label: "Prefiro não mencionar" },
              ]}
            />
            {formData.papel === "outro" && (
              <div className={styles.outroInput}>
                <Input
                  label="Especifique o papel"
                  value={formData.papelOutro}
                  onChange={(e) => set("papelOutro", e.target.value)}
                  placeholder="Informe o seu papel"
                  fullWidth
                />
              </div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.optionalLabel}>
              Identificação do notificador (opcional)
            </span>
            <div className={styles.optionalFields}>
              <Input
                label="Nome"
                value={formData.nomeNotificador}
                onChange={(e) => set("nomeNotificador", e.target.value)}
                placeholder="Seu nome"
                fullWidth
              />
              <Input
                label="Contato"
                value={formData.contatoNotificador}
                onChange={(e) => set("contatoNotificador", e.target.value)}
                placeholder="E-mail ou telefone"
                fullWidth
              />
            </div>
          </div>
        </StepForm>
      )}
    </div>
  );
}
