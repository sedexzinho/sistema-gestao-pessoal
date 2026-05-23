package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.models.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

  Optional<Categoria> findByNome(String nome);

  // FIX: escopo por usuário
  Optional<Categoria> findByNomeAndUsuarioCategoriaId(String nome, Long usuarioId);

  List<Categoria> findByUsuarioCategoriaIdAndTipo(Long usuarioId, String tipo);

  Optional<Categoria> findByNomeAndUsuarioCategoriaIdAndTipo(String nome, Long usuarioId, String tipo);

  List<Categoria> findByUsuarioCategoriaId(Long usuarioId);


}