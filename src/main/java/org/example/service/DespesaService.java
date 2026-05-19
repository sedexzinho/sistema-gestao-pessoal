package org.example.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import org.example.DTO.DespesaResponseDTO;
import org.example.exceptions.ResourceNotFoundException;
import org.example.exceptions.DuplicateResourceException;
import org.example.models.Categoria;
import org.example.models.Despesa;
import org.example.models.User;
import org.example.repository.CategoriaRepository;
import org.example.repository.DespesaRepository;
import org.example.repository.UsersRepository;

import jakarta.transaction.Transactional;

@Service
public class DespesaService {

    private final DespesaRepository despesaRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsersRepository usersRepository;

    public DespesaService(DespesaRepository despesaRepository, CategoriaRepository categoriaRepository,
            UsersRepository usersRepository) {
        this.categoriaRepository = categoriaRepository;
        this.despesaRepository = despesaRepository;
        this.usersRepository = usersRepository;
    }

    @Transactional
    public DespesaResponseDTO criarDespesa(DespesaResponseDTO dto, Long usuarioId) {

        User usuario = usersRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + usuarioId));

        // FIX: duplicidade escopada por usuário
        if (despesaRepository.findByNomeAndUsuarioDespesaId(dto.getNome(), usuarioId).isPresent()) {
            throw new DuplicateResourceException("Você já possui uma despesa com esse nome: " + dto.getNome());
        }

        // FIX: categoria escopada por usuário
        Categoria categoria = categoriaRepository
        .findByNomeAndUsuarioCategoriaIdAndTipo(dto.getNomeCategoria(), usuarioId, "DESPESA")
        .orElseThrow(() -> new ResourceNotFoundException(
                "Nenhuma categoria de DESPESA '" + dto.getNomeCategoria() + "' encontrada para este usuário."));

        Despesa despesa = new Despesa();
        despesa.setNome(dto.getNome());
        despesa.setValorDespesa(dto.getValor());
        despesa.setCategoria(categoria);
        despesa.setDiaPagamento(dto.getDiaPagamento());
        despesa.setUsuarioDespesa(usuario);
        despesa.setConcluido(false);

        // FIX: inicializa campos de parcelamento corretamente
        if (Boolean.TRUE.equals(dto.getIsParcelado())) {
            despesa.setIsParcelado(true);
            despesa.setTipo("PARCELADO");
            despesa.setStatus("EM_ANDAMENTO");
            despesa.setParcelaAtual(1);
            despesa.setTotalParcelas(dto.getTotalParcelas());
            despesa.setValorParcela(dto.getValorParcela());
        } else {
            despesa.setIsParcelado(false);
            despesa.setTipo("AVULSO");
            despesa.setStatus("EM_ANDAMENTO");
        }

        Despesa despesaSalva = despesaRepository.save(despesa);
        return toResponseDTO(despesaSalva);
    }

    @Transactional
    public List<DespesaResponseDTO> listarTodas() {
        List<Despesa> encontrarDespesas = despesaRepository.findAll();
        List<DespesaResponseDTO> resultado = new ArrayList<>();
        for (Despesa despesas : encontrarDespesas) {
            resultado.add(toResponseDTO(despesas));
        }
        return resultado;
    }

    @Transactional
    public DespesaResponseDTO buscarID(Long id) {
        Despesa despesa = despesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma despesa com esse ID: " + id));
        return toResponseDTO(despesa);
    }

    @Transactional
    public DespesaResponseDTO alterarDespesa(Long id, DespesaResponseDTO dto, Long usuarioId) {
        Despesa despesa = despesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma despesa com esse ID: " + id));

        despesa.setNome(dto.getNome());
        despesa.setIsParcelado(dto.getIsParcelado());
        despesa.setDiaPagamento(dto.getDiaPagamento());
        despesa.setValorDespesa(dto.getValor());

        if (dto.getNomeCategoria() != null && !dto.getNomeCategoria().isEmpty()) {
            // FIX: busca categoria pelo usuário dono da despesa, sem criar categoria órfã
            Categoria categoria = categoriaRepository
                    .findByNomeAndUsuarioCategoriaIdAndTipo(dto.getNomeCategoria(), usuarioId, "DESPESA")
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Nenhuma categoria de DESPESA '" + dto.getNomeCategoria()
                                    + "' encontrada para este usuário."));
            despesa.setCategoria(categoria);
        }

        Despesa despesaSalva = despesaRepository.save(despesa);
        return toResponseDTO(despesaSalva);
    }

    @Transactional
    public void deletarDespesaPorId(Long id) {
        if (!despesaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Não existe nenhuma despesa com esse ID: " + id);
        }
        despesaRepository.deleteById(id);
    }

    // FIX: toResponseDTO agora mapeia todos os campos de parcelamento
    private DespesaResponseDTO toResponseDTO(Despesa despesa) {
        DespesaResponseDTO dto = new DespesaResponseDTO();
        dto.setId(despesa.getId());
        dto.setNome(despesa.getNome());
        dto.setNomeCategoria(despesa.getCategoria().getNome());
        dto.setValor(despesa.getValorDespesa());
        dto.setTipo(despesa.getTipo());
        dto.setStatus(despesa.getStatus());
        dto.setIsParcelado(despesa.getIsParcelado());
        dto.setDiaPagamento(despesa.getDiaPagamento());
        dto.setDataRegistro(despesa.getDataRegistro());
        dto.setIdUsuario(despesa.getUsuarioDespesa().getId());
        dto.setValorParcela(despesa.getValorParcela());
        dto.setTotalParcelas(despesa.getTotalParcelas());
        dto.setParcelaAtual(despesa.getParcelaAtual());
        return dto;
    }
}