package org.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.models.Receitas;


@Repository
public interface ReceitasRepository extends JpaRepository<Receitas, Long> {

}
