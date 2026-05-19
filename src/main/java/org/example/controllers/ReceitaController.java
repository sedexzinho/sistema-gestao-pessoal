package org.example.controllers;

import java.util.List;

import org.example.DTO.ReceitaResponseDTO;
import org.example.service.ReceitaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sistemaDespesas/receitas")
@RequiredArgsConstructor
public class ReceitaController {

    private final ReceitaService receitaService;

    // POST http://localhost:8080/api/sistemaDespesas/receitas/1
    @PostMapping("/{usuarioId}")
    public ResponseEntity<ReceitaResponseDTO> criarReceita(
            @RequestBody ReceitaResponseDTO dto,
            @PathVariable Long usuarioId) {
        ReceitaResponseDTO criada = receitaService.criarReceita(dto, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    // GET http://localhost:8080/api/sistemaDespesas/receitas/buscar/1
    @GetMapping("/buscar/{id}")
    public ResponseEntity<ReceitaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(receitaService.buscarId(id));
    }

    // GET http://localhost:8080/api/sistemaDespesas/receitas/listar
    @GetMapping("/listar")
    public ResponseEntity<List<ReceitaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(receitaService.listarTodas());
    }

    // PUT http://localhost:8080/api/sistemaDespesas/receitas/alterar/1/1
    @PutMapping("/alterar/{id}/{usuarioId}")
    public ResponseEntity<ReceitaResponseDTO> alterarReceita(
            @PathVariable Long id,
            @PathVariable Long usuarioId,
            @RequestBody ReceitaResponseDTO dto) {
        return ResponseEntity.ok(receitaService.alterarReceita(id, dto, usuarioId));
    }

    // DELETE http://localhost:8080/api/sistemaDespesas/receitas/deletar/1
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletarReceita(@PathVariable Long id) {
        receitaService.deletarReceita(id);
        return ResponseEntity.noContent().build();
    }
}