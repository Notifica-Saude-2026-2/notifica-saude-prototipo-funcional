import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Input } from "../../components/common/ui/Input";
import { Button } from "../../components/common/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../services/api";
import styles from "./Login.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolverMensagemErro(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return "E-mail ou senha incorretos. Verifique e tente novamente.";
    }
    if (err.status === 403) {
      return "Sua conta não tem permissão para acessar o sistema.";
    }
    if (err.status === 429) {
      return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
    }
    return "Algo deu errado no servidor. Tente novamente em instantes.";
  }
  return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [senhaError, setSenhaError] = useState("");

  // redireciona após estado ser commitado pelo React
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // já logado: evita flash da tela de login
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  function validateEmail(value: string): string {
    if (!value.trim()) return "O e-mail é obrigatório.";
    if (!EMAIL_REGEX.test(value.trim())) return "Informe um e-mail válido (exemplo@dominio.com).";
    return "";
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setEmail(value);
    if (emailError) setEmailError(validateEmail(value));
  }

  function handleEmailBlur() {
    setEmailError(validateEmail(email));
  }

  function handleSenhaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSenha(value);
    if (senhaError && value.trim()) setSenhaError("");
  }

  const emailInvalid = email.trim().length > 0 && !EMAIL_REGEX.test(email.trim());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(email);
    const senhaErr = !senha.trim() ? "A senha é obrigatória." : "";
    setEmailError(emailErr);
    setSenhaError(senhaErr);
    if (emailErr || senhaErr) return;

    setIsLoading(true);
    try {
      await login(email, senha);
      // navegação ocorre via useEffect após isAuthenticated virar true
    } catch (err) {
      setError(resolverMensagemErro(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.infoColumn}>
          <h1 className={styles.cardTitle}>Entrar na conta</h1>
          <p className={styles.infoSubtitle}>Não tem uma conta?</p>
          <p className={styles.infoText}>
            Entre em contato com o administrador da sua instituição.
          </p>
        </div>

        <div className={styles.divider} />

        <form className={styles.formColumn} onSubmit={handleSubmit} noValidate>
          <Input
            label="Usuário"
            labelClassName={styles.inputLabel}
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="Digite seu email"
            type="email"
            fullWidth
            error={emailError}
            errorTestId="login-email-error"
            data-testid="login-email"
          />

          <div className={styles.passwordGroup}>
            <Input
              label="Senha"
              labelClassName={styles.inputLabel}
              value={senha}
              onChange={handleSenhaChange}
              placeholder="Digite sua senha"
              type="password"
              showPasswordToggle
              fullWidth
              error={senhaError}
              errorTestId="login-password-error"
              data-testid="login-senha"
            />
            <Link to="/esqueceu-senha" className={styles.forgotLink}>
              Esqueceu a senha?
            </Link>
          </div>

          {error && (
            <div className={styles.errorAlert} role="alert">
              <span className={styles.errorIcon}>⚠</span>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          )}

          <Button
            title={isLoading ? "Entrando..." : "Entrar na conta"}
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading || emailInvalid}
            className={styles.loginButton}
            data-testid="login-submit"
          />
        </form>
      </div>
    </div>
  );
}
