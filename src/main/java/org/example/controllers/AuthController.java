package org.example.controllers;

import lombok.RequiredArgsConstructor;
import org.example.DTO.AuthDTO;
import org.example.models.User;
import org.example.repository.UsersRepository;
import org.example.service.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sistemaDespesas/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final UsersRepository usersRepository;
        private final TokenService tokenService;
        private final PasswordEncoder passwordEncoder;

        // POST http://localhost:8080/api/sistemaDespesas/auth/login
        @PostMapping("/login")
        public ResponseEntity<Map<String, Object>> login(@RequestBody AuthDTO dto) {
                UsernamePasswordAuthenticationToken credentials = new UsernamePasswordAuthenticationToken(
                                dto.getEmail(), dto.getSenha());

                Authentication auth = authenticationManager.authenticate(credentials);
                User user = (User) auth.getPrincipal();
                String token = tokenService.gerarToken(user);

                return ResponseEntity.ok(Map.of(
                                "token", token,
                                "nome", user.getNome(),
                                "id", user.getId().toString(),
                                "salarioMensal", user.getSalarioMensal() != null ? user.getSalarioMensal() : 0));
        }

        // POST http://localhost:8080/api/sistemaDespesas/auth/registro
        @PostMapping("/registro")
        public ResponseEntity<Map<String, String>> registro(@RequestBody AuthDTO dto) {
                if (usersRepository.findByEmail(dto.getEmail()).isPresent()) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                        .body(Map.of("erro", "Email já cadastrado."));
                }

                User novoUsuario = User.builder()
                                .nome(dto.getNome())
                                .email(dto.getEmail())
                                .senha(passwordEncoder.encode(dto.getSenha()))
                                .codigo(dto.getCodigo())
                                .salarioMensal(dto.getSalarioMensal())
                                .role("ROLE_USER")
                                .build();

                usersRepository.save(novoUsuario);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(Map.of("mensagem", "Usuário criado com sucesso."));
        }
}