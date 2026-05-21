interface Props {
  titulo: string;
  valor: string;
  descricao: string;
  icone: string;
  cor?: 'verde' | 'vermelho' | 'branco' | 'amarelo';
}

export function CardResumo({ titulo, valor, descricao, icone, cor = 'branco' }: Props) {
  const cores: Record<string, string> = {
    verde: '#9BFF97',
    vermelho: '#FF5C5C',
    amarelo: '#FFB347',
    branco: '#FFFFFF',
  };

  return (
    <div style={styles.card}>
      <div style={styles.topo}>
        <p style={styles.titulo}>{titulo}</p>
        <span style={{ ...styles.icone }}>{icone}</span>
      </div>
      <p style={{ ...styles.valor, color: cores[cor] }}>{valor}</p>
      <p style={styles.descricao}>{descricao}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    flex: 1,
    minWidth: '180px',
  },
  topo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  titulo: {
    color: '#A0A0A0',
    fontSize: '0.78rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  icone: {
    fontSize: '1.25rem',
    backgroundColor: '#2A2A2A',
    borderRadius: '8px',
    padding: '0.35rem',
  },
  valor: {
    fontSize: '1.6rem',
    fontWeight: 700,
    margin: '0 0 0.25rem 0',
  },
  descricao: {
    color: '#555',
    fontSize: '0.8rem',
    margin: 0,
  },
};