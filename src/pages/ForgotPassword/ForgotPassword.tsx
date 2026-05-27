import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../../components/common/ui/Input";
import { Button } from "../../components/common/ui/Button";
import { EnvelopeIcon } from "../../assets/icons/EnvelopeIcon";
import { forgotPasswordRequest } from "../../services/password.service";
import { ApiError } from "../../services/api";
import styles from "./ForgotPassword.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Estado = "idle" | "loading" | "success" | "error";

function resolverMensagemErro(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) {
      return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
    }
    return "Algo deu errado no servidor. Tente novamente em instantes.";
  }
  return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setEstado("loading");
    try {
      await forgotPasswordRequest(email.trim());
      setEstado("success");
    } catch (err) {
      setEstado("error");
      setErro(resolverMensagemErro(err));
    }
  }

  if (estado === "success") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successContent}>
            <EnvelopeIcon width={40} fill="#183eff" />
            <h1 className={styles.successTitle}>E-mail enviado</h1>
            <p className={styles.successText}>
              Se este e-mail estiver cadastrado no sistema, você receberá um
              link para redefinir sua senha em breve. Verifique também a caixa
              de spam.
            </p>
            <Link to="/login" className={styles.backLink}>
              ← Voltar ao login
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
          <h1 className={styles.cardTitle}>Recuperar senha</h1>
          <p className={styles.infoText}>
            Informe o e-mail cadastrado na sua conta. Enviaremos um link para
            você criar uma nova senha. O link expira em 1 hora.
          </p>
          <Link to="/login" className={styles.backLink}>
            ← Voltar ao login
          </Link>
        </div>

        <div className={styles.divider} />

        <form className={styles.formColumn} onSubmit={handleSubmit} noValidate>
          <Input
            label="E-mail"
            labelClassName={styles.inputLabel}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail cadastrado"
            type="email"
            fullWidth
            data-testid="forgot-password-email-input"
          />

          {estado === "error" && (
            <div className={styles.errorAlert} role="alert">
              <span className={styles.errorIcon}>⚠</span>
              <p className={styles.errorMessage}>{erro}</p>
            </div>
          )}

          <Button
            title={estado === "loading" ? "Enviando..." : "Enviar link de recuperação"}
            variant="contained"
            color="primary"
            fullWidth
            disabled={estado === "loading" || !EMAIL_REGEX.test(email.trim())}
            className={styles.submitButton}
            data-testid="forgot-password-submit-button"
          />
        </form>
      </div>
    </div>
  );
}
