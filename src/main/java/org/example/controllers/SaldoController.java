package org.example.controllers;

import java.math.BigDecimal;

import org.example.service.SaldoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sistemaDespesas/saldo")
@RequiredArgsConstructor
public class SaldoController {

    private final SaldoService saldoService;

    // GET http://localhost:8080/api/sistemaDespesas/saldo/1
    @GetMapping("/{usuarioId}")
    public ResponseEntity<BigDecimal> calcularSaldo(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(saldoService.calcularSaldo(usuarioId));
    }
}