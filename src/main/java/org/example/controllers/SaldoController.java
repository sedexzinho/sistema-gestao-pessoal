package org.example.controllers;

import java.math.BigDecimal;

import org.example.models.User;
import org.example.service.SaldoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sistemaDespesas/saldo")
@RequiredArgsConstructor
public class SaldoController {

    private final SaldoService saldoService;

    // GET http://localhost:8080/api/sistemaDespesas/saldo/1
    @GetMapping
    public ResponseEntity<BigDecimal> calcularSaldo() {
        User user = (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(saldoService.calcularSaldo(user.getId()));
    }
}