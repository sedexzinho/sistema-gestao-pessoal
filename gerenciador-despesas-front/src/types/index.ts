export interface User {
  id: string;
  nome: string;
  email: string;
  token: string;
}

export interface CategoriaDTO {
  idCategoria?: number;
  nome: string;
  usuarioId?: number;
  tipo?: string;
}
export interface AuthResponse {
  token: string;
  nome: string;
  id: string;
  salarioMensal?: number;
}

export interface DespesaDTO {
  id?: number;
  nome: string;
  nomeCategoria: string;
  valor: number;
  isParcelado: boolean;
  diaPagamento: number;
  totalParcelas?: number;
  valorParcela?: number;
  tipo?: string;
  status?: string;
  parcelaAtual?: number;
  dataRegistro?: string;
  idUsuario?: number;
}

export interface ReceitaDTO {
  id?: number;
  nomeReceita: string;
  tipoReceita: string;
  valorReceita: number;
  statusReceita?: string;
  dataRecebimentoReceita?: string;
  ativoReceita: boolean;
  usuarioId?: number;
  nomeCategoria: string;
}

export interface AuthResponse {
  token: string;
  nome: string;
  id: string;
}