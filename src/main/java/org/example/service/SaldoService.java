package org.example.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.example.models.Despesa;
import org.example.models.Receitas;
import org.example.repository.DespesaRepository;
import org.example.repository.ReceitasRepository;
import org.example.repository.UsersRepository;
import org.example.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SaldoService {

    private final ReceitasRepository receitasRepository;
    private final DespesaRepository despesaRepository;
    private final UsersRepository usersRepository;

    public BigDecimal calcularSaldo(Long usuarioId) {
        usersRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + usuarioId));

        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));

        // Soma todas as receitas recebidas
        List<Receitas> receitasRecebidas = receitasRepository
                .findByUsuarioReceitaIdAndStatusReceita(usuarioId, "RECEBIDO");

        BigDecimal totalReceitas = receitasRecebidas.stream()
                .map(Receitas::getValorReceita)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Busca todas as despesas do usuário
        List<Despesa> despesas = despesaRepository.findByUsuarioDespesaId(usuarioId);

        BigDecimal totalDespesas = BigDecimal.ZERO;

        for (Despesa despesa : despesas) {

            // Despesa AVULSO: desconta imediatamente
            if ("AVULSO".equals(despesa.getTipo())) {
                totalDespesas = totalDespesas.add(despesa.getValorDespesa());
            }

            // Despesa PARCELADA: desconta apenas parcelas já vencidas
            // Parcela vence no mês seguinte ao da compra
            if ("PARCELADO".equals(despesa.getTipo()) && despesa.getParcelaAtual() != null) {
                int parcelasVencidas = calcularParcelasVencidas(despesa, hoje);
                if (parcelasVencidas > 0 && despesa.getValorParcela() != null) {
                    BigDecimal totalParcelasVencidas = despesa.getValorParcela()
                            .multiply(BigDecimal.valueOf(parcelasVencidas));
                    totalDespesas = totalDespesas.add(totalParcelasVencidas);
                }
            }
        }

        return totalReceitas.subtract(totalDespesas);
    }

    private int calcularParcelasVencidas(Despesa despesa, LocalDate hoje) {
        // A primeira parcela vence no mês seguinte ao registro
        LocalDate dataRegistro = despesa.getDataRegistro();
        if (dataRegistro == null || despesa.getDiaPagamento() == null) return 0;

        // Primeira parcela vence no mês seguinte
        LocalDate primeiroVencimento = dataRegistro
                .plusMonths(1)
                .withDayOfMonth(Math.min(despesa.getDiaPagamento(),
                        dataRegistro.plusMonths(1).lengthOfMonth()));

        if (hoje.isBefore(primeiroVencimento)) return 0;

        // Conta quantos vencimentos já passaram até hoje
        int mesesVencidos = 0;
        LocalDate vencimento = primeiroVencimento;
        int totalParcelas = despesa.getTotalParcelas() == null ? 0 : despesa.getTotalParcelas();

        while (!vencimento.isAfter(hoje) && mesesVencidos < totalParcelas) {
            mesesVencidos++;
            vencimento = vencimento.plusMonths(1);
        }

        return mesesVencidos;
    }
}