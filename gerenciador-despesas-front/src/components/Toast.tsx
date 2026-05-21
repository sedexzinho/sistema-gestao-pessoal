import { useEffect, useState } from 'react';

interface Props {
  mensagem: string;
  tipo?: 'sucesso' | 'erro';
  onClose: () => void;
}

export function Toast({ mensagem, tipo = 'sucesso', onClose }: Props) {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisivel(false);
      setTimeout(onClose, 300);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      ...styles.toast,
      backgroundColor: tipo === 'sucesso' ? 'rgba(155, 255, 151, 0.1)' : 'rgba(255, 92, 92, 0.1)',
      border: `1px solid ${tipo === 'sucesso' ? '#9BFF97' : '#FF5C5C'}`,
      opacity: visivel ? 1 : 0,
      transform: visivel ? 'translateY(0)' : 'translateY(20px)',
    }}>
      <span style={{ fontSize: '1.25rem' }}>
        {tipo === 'sucesso' ? '✅' : '❌'}
      </span>
      <p style={{
        ...styles.texto,
        color: tipo === 'sucesso' ? '#9BFF97' : '#FF5C5C',
      }}>
        {mensagem}
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    zIndex: 9999,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    backdropFilter: 'blur(8px)',
  },
  texto: {
    margin: 0,
    fontWeight: 600,
    fontSize: '0.95rem',
  },
};