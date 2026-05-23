import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Input } from "../../components/common/ui/Input";
import { Button } from "../../components/common/ui/Button";
import { resetPasswordRequest } from "../../services/password.service";
import { ApiError } from "../../services/api";
import { validarSenha, rulesList } from "../../utils/passwordRules";
import styles from "./ResetPassword.module.css";

type Estado = "idle" | "loading" | "success" | "token_invalido" | "error";

function resolverMensagemErro(err: unknown): { tipo: "token_invalido" | "error"; mensagem: string } {
  if (err instanceof ApiError) {
    if (err.status === 400 || err.status === 404 || err.status === 410) {
      return {
        tipo: "token_invalido",
        mensagem: "Este link de redefinição é inválido ou já expirou.",
      };
    }
    if (err.status === 429) {
      return {
        tipo: "error",
        mensagem: "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.",
      };
    }
    return {
      tipo: "error",
      mensagem: "Algo deu errado no servidor. Tente novamente em instantes.",
    };
  }
  return {
    tipo: "error",
    mensagem: "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
  };
}

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    const erroValidacao = validarSenha(novaSenha);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setErro("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    setEstado("loading");
    try {
      await resetPasswordRequest(token ?? "", novaSenha);
      setEstado("success");
    } catch (err) {
      const { tipo, mensagem } = resolverMensagemErro(err);
      setEstado(tipo);
      setErro(mensagem);
    }
  }

  if (estado === "success") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successContent}>
            <span className={styles.successIcon}>✅</span>
            <h1 className={styles.successTitle}>Senha redefinida</h1>
            <p className={styles.successText}>
              Sua senha foi alterada com sucesso. Você já pode fazer login com
              a nova senha.
            </p>
            <Link to="/login" className={styles.backLink}>
              Ir para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.infoColumn}>
          <h1 className={styles.cardTitle}>Nova senha</h1>
          <p className={styles.infoText}>
            Escolha uma senha forte para proteger sua conta.
          </p>
          <ul className={styles.rulesList}>
            {rulesList.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <Link to="/login" className={styles.backLink}>
            ← Voltar ao login
          </Link>
        </div>

        <div className={styles.divider} />

        <form className={styles.formColumn} onSubmit={handleSubmit} noValidate>
          <Input
            label="Nova senha"
            labelClassName={styles.inputLabel}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Digite sua nova senha"
            type="password"
            showPasswordToggle
            fullWidth
            data-testid="reset-password-new-input"
          />

          <Input
            label="Confirmar nova senha"
            labelClassName={styles.inputLabel}
            value={confirmaSenha}
            onChange={(e) => setConfirmaSenha(e.target.value)}
            placeholder="Repita a nova senha"
            type="password"
            showPasswordToggle
            fullWidth
            data-testid="reset-password-confirm-input"
          />

          {estado === "token_invalido" && (
            <div className={styles.tokenErrorAlert} role="alert">
              <p className={styles.tokenErrorMessage}>
                ⚠ {erro}
              </p>
              <Link to="/esqueceu-senha" className={styles.tokenErrorLink}>
                Solicitar um novo link de recuperação →
              </Link>
            </div>
          )}

          {(estado === "error" || (estado === "idle" && erro)) && (
            <div className={styles.errorAlert} role="alert">
              <span className={styles.errorIcon}>⚠</span>
              <p className={styles.errorMessage}>{erro}</p>
            </div>
          )}

          <Button
            title={estado === "loading" ? "Salvando..." : "Redefinir senha"}
            variant="contained"
            color="primary"
            fullWidth
            disabled={
              estado === "loading" ||
              estado === "token_invalido" ||
              novaSenha.trim() === "" ||
              confirmaSenha.trim() === ""
            }
            className={styles.submitButton}
            data-testid="reset-password-submit-button"
          />
        </form>
      </div>
    </div>
  );
}
