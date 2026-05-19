package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.models.Despesa;

@Repository
public interface DespesaRepository extends JpaRepository<Despesa, Long> {

    // FIX: escopo por usuário
    Optional<Despesa> findByNomeAndUsuarioDespesaId(String nome, Long usuarioId);

    List<Despesa> findByIsParceladoTrueAndConcluidoFalse();

    List<Despesa> findByUsuarioDespesaId(Long usuarioId);
}