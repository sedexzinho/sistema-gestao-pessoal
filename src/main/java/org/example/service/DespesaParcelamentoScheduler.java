package org.example.service;

import java.time.LocalDate;
import java.util.List;

import org.example.models.Despesa;
import org.example.repository.DespesaRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DespesaParcelamentoScheduler {

    private final DespesaRepository despesaRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void verificarParcelas() {
        log.info("Iniciando verificação de parcelas - {}", LocalDate.now());

        List<Despesa> despesasParceladas = despesaRepository
                .findByIsParceladoTrueAndConcluidoFalse();

        LocalDate hoje = LocalDate.now();
        int diaHoje = hoje.getDayOfMonth();

        for (Despesa despesa : despesasParceladas) {

            // Verifica se hoje é o dia de vencimento
            if (despesa.getDiaPagamento() == null || !despesa.getDiaPagamento().equals(diaHoje)) {
                continue;
            }

            // Proteção: verifica se já processou no mês corrente
            if (jaProcessouEsseMes(despesa, hoje)) {
                log.warn("Despesa '{}' já foi processada em {}/{}. Pulando.",
                        despesa.getNome(), hoje.getMonthValue(), hoje.getYear());
                continue;
            }

            int parcelaAtual = despesa.getParcelaAtual() == null ? 0 : despesa.getParcelaAtual();
            int totalParcelas = despesa.getTotalParcelas() == null ? 0 : despesa.getTotalParcelas();

            int novaParcelaAtual = parcelaAtual + 1;
            int parcelasRestantes = totalParcelas - novaParcelaAtual;

            despesa.setParcelaAtual(novaParcelaAtual);
            despesa.setUltimoPagamento(hoje);
            despesa.setDataUltimoProcessamento(hoje);

            if (parcelasRestantes <= 0) {
                despesa.setConcluido(true);
                despesa.setStatus("CONCLUIDO");
                log.info("Despesa '{}' concluída após {} parcelas.", despesa.getNome(), totalParcelas);
            } else {
                despesa.setStatus("EM_ANDAMENTO");
                log.info("Despesa '{}' - parcela {}/{} processada. Restantes: {}",
                        despesa.getNome(), novaParcelaAtual, totalParcelas, parcelasRestantes);
            }

            despesaRepository.save(despesa);
        }

        log.info("Verificação de parcelas finalizada.");
    }

    private boolean jaProcessouEsseMes(Despesa despesa, LocalDate hoje) {
        LocalDate ultimo = despesa.getDataUltimoProcessamento();
        if (ultimo == null) return false;

        return ultimo.getYear() == hoje.getYear()
                && ultimo.getMonthValue() == hoje.getMonthValue();
    }
}