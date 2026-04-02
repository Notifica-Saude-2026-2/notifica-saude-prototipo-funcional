import { useState } from "react";
import { Header, Footer } from "../../components/common/layout";
import { Button, Input } from "../../components/common/ui";
import styles from "./TestPage.module.css";

export function TestPage() {
  const [name, setName] = useState("");

  return (
    <>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          <h1>Teste de Componentes</h1>

          <p>Validação dos componentes reutilizáveis</p>

          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
            fullWidth
          />

          <div className={styles.buttons}>
            <Button variant="contained">Conteiner</Button>

            <Button variant="outlined">Outlined</Button>

            <Button disabled>Deesabilitado</Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}