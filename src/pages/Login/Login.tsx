import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Input } from '../../components/common/ui/Input';
import { Button } from '../../components/common/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../services/api';
import styles from './Login.module.css';

function resolverMensagemErro(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) {
      return 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';
    }
    if (err.status === 429) {
      return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.';
    }
    return 'Algo deu errado no servidor. Tente novamente em instantes.';
  }
  return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // redireciona após estado ser commitado pelo React
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // já logado: evita flash da tela de login
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            type="email"
            fullWidth
            data-testid="login-email"
          />

          <div className={styles.passwordGroup}>
            <Input
              label="Senha"
              labelClassName={styles.inputLabel}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              type="password"
              showPasswordToggle
              fullWidth
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
            title={isLoading ? 'Entrando...' : 'Entrar na conta'}
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            className={styles.loginButton}
            data-testid="login-submit"
          />
        </form>

      </div>
    </div>
  );
}
