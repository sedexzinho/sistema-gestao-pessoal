package org.example.controllers;

import java.util.List;

import org.example.DTO.DespesaResponseDTO;
import org.example.service.DespesaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sistemaDespesas/despesas")
@RequiredArgsConstructor
public class DespesaController {

    private final DespesaService despesaService;

    // POST http://localhost:8080/api/sistemaDespesas/despesas/1
    @PostMapping("/{usuarioId}")
    public ResponseEntity<DespesaResponseDTO> criarDespesa(
            @RequestBody DespesaResponseDTO dto,
            @PathVariable Long usuarioId) {

        DespesaResponseDTO criada = despesaService.criarDespesa(dto, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    // GET http://localhost:8080/api/sistemaDespesas/despesas/listar
    @GetMapping("/listar")
    public ResponseEntity<List<DespesaResponseDTO>> listarTodas() {
        List<DespesaResponseDTO> despesas = despesaService.listarTodas();
        return ResponseEntity.ok(despesas);
    }

    // GET http://localhost:8080/api/sistemaDespesas/despesas/buscar/1
    @GetMapping("/buscar/{id}")
    public ResponseEntity<DespesaResponseDTO> buscarPorId(@PathVariable Long id) {
        DespesaResponseDTO despesa = despesaService.buscarID(id);
        return ResponseEntity.ok(despesa);
    }

    // PUT http://localhost:8080/api/sistemaDespesas/despesas/alterar/1
    @PutMapping("/alterar/{id}/{usuarioId}")
public ResponseEntity<DespesaResponseDTO> alterarDespesa(
        @PathVariable Long id,
        @PathVariable Long usuarioId,
        @RequestBody DespesaResponseDTO dto) {

    DespesaResponseDTO atualizada = despesaService.alterarDespesa(id, dto, usuarioId);
    return ResponseEntity.ok(atualizada);
}

    // DELETE http://localhost:8080/api/sistemaDespesas/despesas/deletar/1
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletarDespesa(@PathVariable Long id) {
        despesaService.deletarDespesaPorId(id);
        return ResponseEntity.noContent().build();
    }
}
