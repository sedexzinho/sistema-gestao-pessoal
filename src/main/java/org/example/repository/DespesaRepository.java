package org.example.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.models.Despesa;


@Repository
public interface DespesaRepository extends JpaRepository<Despesa, Long> {
    Optional<Despesa> findByNome(String nome);
}
