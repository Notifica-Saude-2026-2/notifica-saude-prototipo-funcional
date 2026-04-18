import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/common/ui/Input';
import { Button } from '../../components/common/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Usuário ou senha inválidos.');
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite seu email"
            type="email"
            fullWidth
          />

          <div className={styles.passwordGroup}>
            <Input
              label="Senha"
              labelClassName={styles.inputLabel}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              type="password"
              fullWidth
            />
            <Link to="/esqueceu-senha" className={styles.forgotLink}>
              Esqueceu a senha?
            </Link>
          </div>

          {error && <p className={styles.formError}>{error}</p>}

          <Button
            title={isLoading ? 'Entrando...' : 'Entrar na conta'}
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            className={styles.loginButton}
          />
        </form>

      </div>
    </div>
  );
}
