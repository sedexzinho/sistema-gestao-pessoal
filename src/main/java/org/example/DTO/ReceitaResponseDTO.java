package org.example.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReceitaResponseDTO {

    private Long id;
    private String nomeReceita;
    private String tipoReceita;
    private BigDecimal valorReceita;
    private String statusReceita;
    private LocalDate dataRecebimentoReceita;
    private LocalDate registradoEmReceita;
    private boolean ativoReceita;
    private Long usuarioId;
    private String nomeCategoria;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeReceita() {
        return nomeReceita;
    }

    public void setNomeReceita(String nomeReceita) {
        this.nomeReceita = nomeReceita;
    }

    public String getTipoReceita() {
        return tipoReceita;
    }

    public void setTipoReceita(String tipoReceita) {
        this.tipoReceita = tipoReceita;
    }

    public BigDecimal getValorReceita() {
        return valorReceita;
    }

    public void setValorReceita(BigDecimal valorReceita) {
        this.valorReceita = valorReceita;
    }

    public String getStatusReceita() {
        return statusReceita;
    }

    public void setStatusReceita(String statusReceita) {
        this.statusReceita = statusReceita;
    }

    public LocalDate getDataRecebimentoReceita() {
        return dataRecebimentoReceita;
    }

    public void setDataRecebimentoReceita(LocalDate dataRecebimentoReceita) {
        this.dataRecebimentoReceita = dataRecebimentoReceita;
    }

    public LocalDate getRegistradoEmReceita() {
        return registradoEmReceita;
    }

    public void setRegistradoEmReceita(LocalDate registradoEmReceita) {
        this.registradoEmReceita = registradoEmReceita;
    }

    public boolean isAtivoReceita() {
        return ativoReceita;
    }

    public void setAtivoReceita(boolean ativoReceita) {
        this.ativoReceita = ativoReceita;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getNomeCategoria() {
        return nomeCategoria;
    }

    public void setNomeCategoria(String nomeCategoria) {
        this.nomeCategoria = nomeCategoria;
    }
}