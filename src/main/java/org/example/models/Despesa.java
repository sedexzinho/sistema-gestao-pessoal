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

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Despesas")
public class Despesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(name = "despe_nome")
    private String nome;

    @Column(name = "tipo")
    private String tipo;

    @Column(name = "status")
    private String status;

    @Column(name = "parcela_atual", nullable = true)
    private Integer parcelaAtual;

    @Column(name = "total_parcelas", nullable = true)
    private Integer totalParcelas;

    @Column(name = "valor_parcela", nullable = true)
    private BigDecimal valorParcela;

    @Column(name = "ultimo_pagamento", nullable = true)
    private LocalDate ultimoPagamento;

    @Column(name = "concluido")
    private Boolean concluido;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private User usuarioDespesa;

    @ManyToOne
    @JoinColumn(name = "categoria_despesa", nullable = false)
    private Categoria categoria;

    @Column(name = "valor_despesa")
    private BigDecimal valorDespesa;

    @Column(name = "isParcelado", nullable = true)
    private Boolean isParcelado;

    @Column(name = "dia_pagamento")
    private Integer diaPagamento;

    @Column(name = "data_registro")
    private LocalDate dataRegistro;

    @PrePersist
    protected void onCreate() {
        this.dataRegistro = LocalDate.now();
    }

    public void setIsParcelado(Boolean isParcelado) {
        this.isParcelado = isParcelado;
    }

}
