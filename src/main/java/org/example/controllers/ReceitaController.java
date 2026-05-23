package org.example.controllers;

import java.util.List;

import org.example.DTO.ReceitaResponseDTO;
import org.example.models.User;
import org.example.service.ReceitaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sistemaDespesas/receitas")
@RequiredArgsConstructor
public class ReceitaController {

    private final ReceitaService receitaService;

    private User getUsuarioAutenticado() {
        return (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }

    @PostMapping
    public ResponseEntity<ReceitaResponseDTO> criarReceita(@RequestBody ReceitaResponseDTO dto) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(receitaService.criarReceita(dto, usuarioId));
    }

    @GetMapping("/buscar/{id}")
    public ResponseEntity<ReceitaResponseDTO> buscarPorId(@PathVariable Long id) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(receitaService.buscarPorIdEUsuario(id, usuarioId));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<ReceitaResponseDTO>> listarTodas() {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(receitaService.listarPorUsuario(usuarioId));
    }

    @PutMapping("/alterar/{id}")
    public ResponseEntity<ReceitaResponseDTO> alterarReceita(
            @PathVariable Long id,
            @RequestBody ReceitaResponseDTO dto) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(receitaService.alterarReceita(id, dto, usuarioId));
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletarReceita(@PathVariable Long id) {
        Long usuarioId = getUsuarioAutenticado().getId();
        receitaService.deletarReceita(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    // PATCH http://localhost:8080/api/sistemaDespesas/receitas/receber/{id}
    @PatchMapping("/receber/{id}")
    public ResponseEntity<ReceitaResponseDTO> receberReceita(@PathVariable Long id) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(receitaService.receberReceita(id, usuarioId));
    }
}