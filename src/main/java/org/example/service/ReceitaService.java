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
import org.springframework.stereotype.Service;

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
    public ReceitaResponseDTO buscarId(Long id) {
        Receitas receita = receitasRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma receita com esse ID: " + id));
        return toResponseDTO(receita);
    }

    @Transactional
    public List<ReceitaResponseDTO> listarTodas() {
        List<Receitas> receitas = receitasRepository.findAll();
        List<ReceitaResponseDTO> resultado = new ArrayList<>();
        for (Receitas receita : receitas) {
            resultado.add(toResponseDTO(receita));
        }
        return resultado;
    }

    @Transactional
    public ReceitaResponseDTO alterarReceita(Long id, ReceitaResponseDTO dto, Long usuarioId) {
        Receitas receita = receitasRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma receita com esse ID: " + id));

        receita.setNomeReceita(dto.getNomeReceita());
        receita.setValorReceita(dto.getValorReceita());
        receita.setDataRecebimentoReceita(dto.getDataRecebimentoReceita());
        receita.setAtivoReceita(dto.isAtivoReceita());

        if (dto.getNomeCategoria() != null && !dto.getNomeCategoria().isEmpty()) {
            Categoria categoria = categoriaRepository
                    .findByNomeAndUsuarioCategoriaIdAndTipo(dto.getNomeCategoria(), usuarioId, "RECEITA")
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Nenhuma categoria de RECEITA '" + dto.getNomeCategoria() + "' encontrada para este usuário."));
            receita.setCategoria(categoria);
        }

        Receitas salva = receitasRepository.save(receita);
        return toResponseDTO(salva);
    }

    @Transactional
    public void deletarReceita(Long id) {
        if (!receitasRepository.existsById(id)) {
            throw new ResourceNotFoundException("Não existe nenhuma receita com esse ID: " + id);
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