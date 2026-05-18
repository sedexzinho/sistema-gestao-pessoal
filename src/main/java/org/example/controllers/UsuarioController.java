package org.example.controllers;

import org.example.DTO.UsuarioResponseDTO;
import org.example.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sistemaDespesas/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UserService userService;

    @PostMapping("/criar")
    public ResponseEntity<UsuarioResponseDTO> criarUsuario(@RequestBody UsuarioResponseDTO dto) {
        UsuarioResponseDTO usuarioCriado = userService.criarUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCriado);
    }
}