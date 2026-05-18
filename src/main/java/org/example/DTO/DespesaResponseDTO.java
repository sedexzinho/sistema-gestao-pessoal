package org.example.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DespesaResponseDTO {

    private Long id;
    private String nome;
    private String nomeCategoria;
    private BigDecimal valor;
    private Boolean isParcelado;
    private Integer diaPagamento;
    private LocalDate dataRegistro;
    private String tipo;
    private BigDecimal valorParcela;
    private Long idUsuario;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getValorParcela() {
        return valorParcela;
    }

    public void setValorParcela(BigDecimal valorParcela) {
        this.valorParcela = valorParcela;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nomeDespesa) {
        this.nome = nomeDespesa;
    }

    public String getNomeCategoria() {
        return nomeCategoria;
    }

    public void setNomeCategoria(String nomeCategoria) {
        this.nomeCategoria = nomeCategoria;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valorDespesa) {
        this.valor = valorDespesa;
    }

    public Boolean getIsParcelado() {
        return isParcelado;
    }

    public void setIsParcelado(Boolean isParcelado) {
        this.isParcelado = isParcelado;
    }

    public Integer getDiaPagamento() {
        return diaPagamento;
    }

    public void setDiaPagamento(Integer diaPagamento) {
        this.diaPagamento = diaPagamento;
    }

    public LocalDate getDataRegistro() {
        return dataRegistro;
    }

    public void setDataRegistro(LocalDate dataResgistro) {
        this.dataRegistro = dataResgistro;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

}
