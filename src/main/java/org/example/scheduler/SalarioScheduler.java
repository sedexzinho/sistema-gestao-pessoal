package org.example.scheduler;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.example.models.Receitas;
import org.example.models.User;
import org.example.repository.ReceitasRepository;
import org.example.repository.UsersRepository;
import org.example.service.DiasUteisService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SalarioScheduler {

    private final UsersRepository usersRepository;
    private final ReceitasRepository receitasRepository;
    private final DiasUteisService diasUteisService;

    @Scheduled(cron = "0 0 6 * * *", zone = "America/Sao_Paulo")
    @Transactional
    public void registrarSalarios() {
        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        int ano = hoje.getYear();
        int mes = hoje.getMonthValue();

        LocalDate quintoDiaUtil = diasUteisService.encontrarQuintoDiaUtil(ano, mes);

        if (!hoje.equals(quintoDiaUtil)) return;

        log.info("Hoje é o 5º dia útil ({}) — registrando salários.", hoje);

        List<User> usuarios = usersRepository.findAll();

        for (User usuario : usuarios) {
            if (usuario.getSalarioMensal() == null) continue;

            // Proteção: verifica se o salário deste mês já foi registrado
            boolean jaRegistrado = receitasRepository
                    .findByNomeReceitaAndUsuarioReceitaId("Salário", usuario.getId())
                    .map(r -> r.getDataRecebimentoReceita() != null
                            && r.getDataRecebimentoReceita().getYear() == ano
                            && r.getDataRecebimentoReceita().getMonthValue() == mes)
                    .orElse(false);

            if (jaRegistrado) {
                log.warn("Salário de {} já registrado em {}/{}. Pulando.", usuario.getNome(), mes, ano);
                continue;
            }

            Receitas salario = new Receitas();
            salario.setNomeReceita("Salário");
            salario.setTipoReceita("SALARIO");
            salario.setValorReceita(usuario.getSalarioMensal());
            salario.setStatusReceita("RECEBIDO");
            salario.setDataRecebimentoReceita(hoje);
            salario.setAtivoReceita(true);
            salario.setUsuarioReceita(usuario);

            receitasRepository.save(salario);
            log.info("Salário de {} registrado: R${}", usuario.getNome(), usuario.getSalarioMensal());
        }
    }
}