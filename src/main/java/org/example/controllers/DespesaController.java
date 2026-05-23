package org.example.controllers;

import java.util.List;

import org.example.DTO.DespesaResponseDTO;
import org.example.models.User;
import org.example.service.DespesaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sistemaDespesas/despesas")
@RequiredArgsConstructor
public class DespesaController {

    private final DespesaService despesaService;

    private User getUsuarioAutenticado() {
        return (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }

    @PostMapping
    public ResponseEntity<DespesaResponseDTO> criarDespesa(@RequestBody DespesaResponseDTO dto) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(despesaService.criarDespesa(dto, usuarioId));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<DespesaResponseDTO>> listarTodas() {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(despesaService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/buscar/{id}")
    public ResponseEntity<DespesaResponseDTO> buscarPorId(@PathVariable Long id) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(despesaService.buscarPorIdEUsuario(id, usuarioId));
    }

    @PutMapping("/alterar/{id}")
    public ResponseEntity<DespesaResponseDTO> alterarDespesa(
            @PathVariable Long id,
            @RequestBody DespesaResponseDTO dto) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(despesaService.alterarDespesa(id, dto, usuarioId));
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletarDespesa(@PathVariable Long id) {
        Long usuarioId = getUsuarioAutenticado().getId();
        despesaService.deletarDespesaPorId(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/pagar/{id}")
    public ResponseEntity<DespesaResponseDTO> pagarDespesa(@PathVariable Long id) {
        Long usuarioId = getUsuarioAutenticado().getId();
        return ResponseEntity.ok(despesaService.pagarDespesa(id, usuarioId));
    }
}