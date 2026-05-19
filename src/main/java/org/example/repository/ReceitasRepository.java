package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.models.Receitas;

@Repository
public interface ReceitasRepository extends JpaRepository<Receitas, Long> {

    Optional<Receitas> findByNomeReceitaAndUsuarioReceitaId(String nomeReceita, Long usuarioId);

    // para o scheduler de receitas recorrentes
    List<Receitas> findByAtivoReceitaTrueAndTipoReceita(String tipoReceita);

    // para o cálculo de saldo — todas as receitas recebidas de um usuário
    List<Receitas> findByUsuarioReceitaIdAndStatusReceita(Long usuarioId, String statusReceita);
}