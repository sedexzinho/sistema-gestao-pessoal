package org.example.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.example.models.Despesa;
import org.example.models.Receitas;
import org.example.models.User;
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

        // Busca o usuário (e já valida se existe)
        User usuario = usersRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + usuarioId));

        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        int mesAtual = hoje.getMonthValue();
        int anoAtual = hoje.getYear();

        // Inclui o salário mensal como base das receitas
        BigDecimal salario = usuario.getSalarioMensal() != null
                ? usuario.getSalarioMensal()
                : BigDecimal.ZERO;

        // Soma receitas RECEBIDAS no mês atual
        List<Receitas> receitasRecebidas = receitasRepository
                .findByUsuarioReceitaIdAndStatusReceita(usuarioId, "RECEBIDO");

        BigDecimal totalReceitas = receitasRecebidas.stream()
                .filter(r -> r.getDataRecebimentoReceita() != null
                        && r.getDataRecebimentoReceita().getMonthValue() == mesAtual
                        && r.getDataRecebimentoReceita().getYear() == anoAtual)
                .map(Receitas::getValorReceita)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Salário + receitas do mês
        totalReceitas = salario.add(totalReceitas);

        // Busca despesas do usuário
        List<Despesa> despesas = despesaRepository.findByUsuarioDespesaId(usuarioId);

        BigDecimal totalDespesas = BigDecimal.ZERO;

        for (Despesa despesa : despesas) {

            // AVULSO: desconta apenas se foi registrada no mês atual
            if ("AVULSO".equals(despesa.getTipo())) {
                if (despesa.getDataRegistro() != null
                        && despesa.getDataRegistro().getMonthValue() == mesAtual
                        && despesa.getDataRegistro().getYear() == anoAtual) {
                    totalDespesas = totalDespesas.add(despesa.getValorDespesa());
                }
            }

            // PARCELADO: desconta apenas parcelas vencidas no mês atual
            if ("PARCELADO".equals(despesa.getTipo()) && despesa.getValorParcela() != null) {
                boolean venceEsseMes = despesa.getDiaPagamento() != null
                        && despesa.getDataRegistro() != null
                        && temParcelaVencendoEsseMes(despesa, hoje);

                if (venceEsseMes) {
                    totalDespesas = totalDespesas.add(despesa.getValorParcela());
                }
            }
        }

        return totalReceitas.subtract(totalDespesas);
    }

    private boolean temParcelaVencendoEsseMes(Despesa despesa, LocalDate hoje) {
        // Primeira parcela vence no mês seguinte ao registro
        LocalDate primeiroVencimento = despesa.getDataRegistro()
                .plusMonths(1)
                .withDayOfMonth(Math.min(
                        despesa.getDiaPagamento(),
                        despesa.getDataRegistro().plusMonths(1).lengthOfMonth()
                ));

        // Conta quantos meses passaram desde o primeiro vencimento
        int mesesDesdeInicio = (hoje.getYear() - primeiroVencimento.getYear()) * 12
                + (hoje.getMonthValue() - primeiroVencimento.getMonthValue());

        if (mesesDesdeInicio < 0) return false;
        if (mesesDesdeInicio >= (despesa.getTotalParcelas() == null ? 0 : despesa.getTotalParcelas())) return false;

        // Verifica se o vencimento desse mês já passou
        LocalDate vencimentoEsseMes = LocalDate.of(
                hoje.getYear(),
                hoje.getMonthValue(),
                Math.min(despesa.getDiaPagamento(), hoje.lengthOfMonth())
        );

        return !hoje.isBefore(vencimentoEsseMes);
    }
}