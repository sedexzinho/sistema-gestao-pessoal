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

    // POST http://localhost:8080/api/sistemaDespesas/categorias/1
    @PostMapping("/criar/{usuarioId}")
    public ResponseEntity<CategoriaResponseDTO> criarCategoria(
            @RequestBody CategoriaResponseDTO dto,
            @PathVariable Long usuarioId) {

        CategoriaResponseDTO criada = categoriaService.criarCategoria(dto, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    // GET http://localhost:8080/api/sistemaDespesas/categorias/buscar/1
    @GetMapping("/buscar/{id}")
    public ResponseEntity<CategoriaResponseDTO> buscarPorId(@PathVariable Long id) {
        CategoriaResponseDTO categoria = categoriaService.buscarId(id);
        return ResponseEntity.ok(categoria);
    }

    // GET http://localhost:8080/api/sistemaDespesas/categorias/listar
    @GetMapping("/listar")
    public ResponseEntity<List<CategoriaResponseDTO>> listarTodas() {
        List<CategoriaResponseDTO> categorias = categoriaService.listarTodas();
        return ResponseEntity.ok(categorias);
    }

    // PUT http://localhost:8080/api/sistemaDespesas/categorias/alterar/1
    @PutMapping("/alterar/{id}")
    public ResponseEntity<CategoriaResponseDTO> alterarCategoria(
            @RequestBody CategoriaResponseDTO dto,
            @PathVariable Long id) {

        CategoriaResponseDTO atualizada = categoriaService.alterarCategoria(dto, id);
        return ResponseEntity.ok(atualizada);
    }

    // DELETE http://localhost:8080/api/sistemaDespesas/categorias/deletar/1
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletarCategoria(@PathVariable Long id) {
        categoriaService.deletarCategoriaPorId(id);
        return ResponseEntity.noContent().build();
    }
}