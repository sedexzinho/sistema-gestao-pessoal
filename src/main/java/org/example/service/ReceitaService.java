package org.example.service;

import java.util.ArrayList;
import java.util.List;

import org.example.DTO.ReceitaResponseDTO;
import org.example.exceptions.DuplicateResourceException;
import org.example.exceptions.ResourceNotFoundException;
import org.example.models.Categoria;
import org.example.models.Receitas;
import org.example.models.User;
import org.example.repository.CategoriaRepository;
import org.example.repository.ReceitasRepository;
import org.example.repository.UsersRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;

@Service
public class ReceitaService {

    private final ReceitasRepository receitasRepository;
    private final UsersRepository usersRepository;
    private final CategoriaRepository categoriaRepository;

    public ReceitaService(ReceitasRepository receitasRepository,
            UsersRepository usersRepository,
            CategoriaRepository categoriaRepository) {
        this.receitasRepository = receitasRepository;
        this.usersRepository = usersRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional
    public ReceitaResponseDTO receberReceita(Long id, Long usuarioId) {
        Receitas receita = receitasRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma receita com esse ID: " + id));

        if (!receita.getUsuarioReceita().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem permissão para alterar essa receita.");
        }

        receita.setStatusReceita("RECEBIDO");
        return toResponseDTO(receitasRepository.save(receita));
    }

    @Transactional
    public ReceitaResponseDTO criarReceita(ReceitaResponseDTO dto, Long usuarioId) {
        User usuario = usersRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + usuarioId));

        if (receitasRepository.findByNomeReceitaAndUsuarioReceitaId(dto.getNomeReceita(), usuarioId).isPresent()) {
            throw new DuplicateResourceException("Você já possui uma receita com esse nome: " + dto.getNomeReceita());
        }

        Categoria categoria = categoriaRepository
                .findByNomeAndUsuarioCategoriaIdAndTipo(dto.getNomeCategoria(), usuarioId, "RECEITA")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nenhuma categoria de RECEITA '" + dto.getNomeCategoria() + "' encontrada para este usuário."));

        Receitas receita = new Receitas();
        receita.setNomeReceita(dto.getNomeReceita());
        receita.setTipoReceita(dto.getTipoReceita());
        receita.setValorReceita(dto.getValorReceita());
        receita.setStatusReceita("PENDENTE");
        receita.setDataRecebimentoReceita(dto.getDataRecebimentoReceita());
        receita.setAtivoReceita(dto.isAtivoReceita());
        receita.setCategoria(categoria);
        receita.setUsuarioReceita(usuario);

        Receitas salva = receitasRepository.save(receita);
        return toResponseDTO(salva);
    }

    @Transactional
    public List<ReceitaResponseDTO> listarPorUsuario(Long usuarioId) {
        List<Receitas> receitas = receitasRepository.findByUsuarioReceitaId(usuarioId);
        List<ReceitaResponseDTO> resultado = new ArrayList<>();
        for (Receitas receita : receitas) {
            resultado.add(toResponseDTO(receita));
        }
        return resultado;
    }

    @Transactional
    public ReceitaResponseDTO buscarPorIdEUsuario(Long id, Long usuarioId) {
        Receitas receita = receitasRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma receita com esse ID: " + id));

        if (!receita.getUsuarioReceita().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem permissão para acessar essa receita.");
        }
        return toResponseDTO(receita);
    }

    @Transactional
    public ReceitaResponseDTO alterarReceita(Long id, ReceitaResponseDTO dto, Long usuarioId) {
        Receitas receita = receitasRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma receita com esse ID: " + id));

        if (!receita.getUsuarioReceita().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem permissão para alterar essa receita.");
        }

        receita.setNomeReceita(dto.getNomeReceita());
        receita.setValorReceita(dto.getValorReceita());
        receita.setDataRecebimentoReceita(dto.getDataRecebimentoReceita());
        receita.setAtivoReceita(dto.isAtivoReceita());

        if (dto.getNomeCategoria() != null && !dto.getNomeCategoria().isEmpty()) {
            Categoria categoria = categoriaRepository
                    .findByNomeAndUsuarioCategoriaIdAndTipo(dto.getNomeCategoria(), usuarioId, "RECEITA")
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Nenhuma categoria de RECEITA '" + dto.getNomeCategoria()
                                    + "' encontrada para este usuário."));
            receita.setCategoria(categoria);
        }

        return toResponseDTO(receitasRepository.save(receita));
    }

    @Transactional
    public void deletarReceita(Long id, Long usuarioId) {
        Receitas receita = receitasRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma receita com esse ID: " + id));

        if (!receita.getUsuarioReceita().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem permissão para deletar essa receita.");
        }
        receitasRepository.deleteById(id);
    }

    public ReceitaResponseDTO toResponseDTO(Receitas receita) {
        ReceitaResponseDTO dto = new ReceitaResponseDTO();
        dto.setId(receita.getId());
        dto.setNomeReceita(receita.getNomeReceita());
        dto.setTipoReceita(receita.getTipoReceita());
        dto.setValorReceita(receita.getValorReceita());
        dto.setStatusReceita(receita.getStatusReceita());
        dto.setDataRecebimentoReceita(receita.getDataRecebimentoReceita());
        dto.setRegistradoEmReceita(receita.getRegistradoEmReceita());
        dto.setAtivoReceita(receita.isAtivoReceita());
        dto.setUsuarioId(receita.getUsuarioReceita().getId());
        dto.setNomeCategoria(receita.getCategoria().getNome());
        return dto;
    }
}