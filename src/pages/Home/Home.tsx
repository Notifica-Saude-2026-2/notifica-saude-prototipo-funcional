import styles from "./Home.module.css";
import { Button } from "../../components/common/ui/Button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        
        <h1 className={styles.title}>Sobre</h1>

        <p className={styles.text}>
          O Notifica Saúde é um sistema destinado ao registro de incidentes e eventos adversos relacionados à assistência à saúde e ao uso de tecnologias como medicamentos e produtos médico-hospitalares.
        </p>

        <p className={styles.text}>
          Você pode contribuir informando situações que causaram ou poderiam causar danos à saúde, ajudando a melhorar a qualidade e a segurança dos serviços de saúde no país.
        </p>

        <div className={styles.actionsContainer}>
          <span className={styles.actionsTitle}>
            SELECIONE SUA FORMA DE ACESSO
          </span>

          <span className={styles.actionsSubtitle}>
            O que gostaria de fazer?
          </span>

          <div className={styles.buttons}>
            <Button
              variant="outlined"
              color="orange"
              fullWidth
              onClick={() => navigate("/notificacao")}
              title="Registrar incidente"
              subtitle="Não é necessário login. Leva menos de 3 minutos."
              data-testid="home-btn-notificacao"
            />

            <Button
              variant="outlined"
              color="green"
              fullWidth
              title="Acessar área profissional"
              subtitle="Para gerenciar notificações e relatórios"
              onClick={() => navigate("/login")}
              data-testid="home-btn-login"
            />
          </div>
        </div>

      </div>
    </div>
  );
}