package org.example.models;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "receitas")
public class Receitas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipoReceita")
    private String tipoReceita;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private User usuarioReceita;

    @Column(name = "nomeReceita")
    private String nomeReceita;

    @Column(name = "valorReceita")
    private BigDecimal valorReceita;

    @Column(name = "statusReceita")
    private String statusReceita;

    @Column(name = "registradoEmReceita")
    private LocalDate registradoEmReceita;

    @Column(name = "dataRecebimentoReceita")
    private LocalDate dataRecebimentoReceita;

    @ManyToOne
    @JoinColumn(name = "categoria_receita", nullable = false)
    private Categoria categoria;

    @Column(name = "ativoReceita")
    private boolean ativoReceita;

    @PrePersist
    protected void onCreate() {
        this.registradoEmReceita = LocalDate.now();
    }

}
