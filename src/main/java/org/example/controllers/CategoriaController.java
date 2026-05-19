package org.example.controllers;

import java.util.List;

import org.example.DTO.CategoriaResponseDTO;
import org.example.service.CategoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sistemaDespesas/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    // POST http://localhost:8080/api/sistemaDespesas/categorias/despesa/1
    @PostMapping("/despesa/{usuarioId}")
    public ResponseEntity<CategoriaResponseDTO> criarCategoriaDespesa(
            @RequestBody CategoriaResponseDTO dto,
            @PathVariable Long usuarioId) {
        CategoriaResponseDTO criada = categoriaService.criarCategoriaDespesa(dto, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    // POST http://localhost:8080/api/sistemaDespesas/categorias/receita/1
    @PostMapping("/receita/{usuarioId}")
    public ResponseEntity<CategoriaResponseDTO> criarCategoriaReceita(
            @RequestBody CategoriaResponseDTO dto,
            @PathVariable Long usuarioId) {
        CategoriaResponseDTO criada = categoriaService.criarCategoriaReceita(dto, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    // GET http://localhost:8080/api/sistemaDespesas/categorias/listar
    @GetMapping("/listar")
    public ResponseEntity<List<CategoriaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(categoriaService.listarTodas());
    }

    // PUT http://localhost:8080/api/sistemaDespesas/categorias/alterar/1
    @PutMapping("/alterar/{id}")
    public ResponseEntity<CategoriaResponseDTO> alterarCategoria(
            @RequestBody CategoriaResponseDTO dto,
            @PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.alterarCategoria(dto, id));
    }

    // DELETE http://localhost:8080/api/sistemaDespesas/categorias/deletar/1
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletarCategoria(@PathVariable Long id) {
        categoriaService.deletarCategoriaPorId(id);
        return ResponseEntity.noContent().build();
    }
}