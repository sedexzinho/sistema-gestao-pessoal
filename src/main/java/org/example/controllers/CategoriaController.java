package org.example.controllers;

import java.util.List;

import org.example.DTO.CategoriaResponseDTO;
import org.example.models.User;
import org.example.service.CategoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sistemaDespesas/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    private User getUsuarioAutenticado() {
        return (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }

    @PostMapping("/despesa")
    public ResponseEntity<CategoriaResponseDTO> criarCategoriaDespesa(@RequestBody CategoriaResponseDTO dto) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoriaService.criarCategoriaDespesa(dto, usuarioId));
    }

    @PostMapping("/receita")
    public ResponseEntity<CategoriaResponseDTO> criarCategoriaReceita(@RequestBody CategoriaResponseDTO dto) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoriaService.criarCategoriaReceita(dto, usuarioId));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<CategoriaResponseDTO>> listarTodas() {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(categoriaService.listarPorUsuario(usuarioId));
    }

    @PutMapping("/alterar/{id}")
    public ResponseEntity<CategoriaResponseDTO> alterarCategoria(
            @RequestBody CategoriaResponseDTO dto,
            @PathVariable Long id) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(categoriaService.alterarCategoria(dto, id, usuarioId));
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletarCategoria(@PathVariable Long id) {
        Long usuarioId = getUsuarioAutenticado().getId();
        categoriaService.deletarCategoriaPorId(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}