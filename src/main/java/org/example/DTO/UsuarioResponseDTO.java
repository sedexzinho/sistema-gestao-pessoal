package org.example.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class UsuarioResponseDTO {
    @NotBlank
    private String nome;
    @NotBlank
    private String codigo;
    @NotNull
    @Positive
    private BigDecimal salarioMensal;
    @NotNull
    private LocalDateTime criadoEm;
    @NotNull
    private Long id; 

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public BigDecimal getSalarioMensal() {
        return salarioMensal;
    }

    public void setSalarioMensal(BigDecimal salarioMensal) {
        this.salarioMensal = salarioMensal;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}