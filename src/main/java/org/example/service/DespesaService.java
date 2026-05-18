package org.example.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

        if (despesaRepository.findByNome(dto.getNome()).isPresent()) {
            throw new DuplicateResourceException("Já existe uma despesa com esse nome: " + dto.getNome());
        }
        User usuario = usersRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("user not found"));// se nao achar cai aqui
        Optional<Categoria> categorOptional = categoriaRepository.findByNome(dto.getNomeCategoria());
        Categoria categoria;
        if (categorOptional.isPresent()) {
            categoria = categorOptional.get();
        } else {
            throw new ResourceNotFoundException(
                    "NENHUMA CATEGORIA COM ESTE NOME: " + dto.getNomeCategoria() + " FOI ENCONTRADA");
        }

        Despesa despesas = new Despesa();
        despesas.setNome(dto.getNome());
        despesas.setValorDespesa(dto.getValor());
        despesas.setCategoria(categoria);
        despesas.setIsParcelado(dto.getIsParcelado());
        if(despesas.getIsParcelado() == false){
            despesas.setTipo("AVULSO");
        }else{
            despesas.setTipo("PARCELADO");
        }
        despesas.setDiaPagamento(dto.getDiaPagamento());
        despesas.setDataRegistro(dto.getDataRegistro());
        despesas.setUsuarioDespesa(usuario);
        Despesa despesaSalva = despesaRepository.save(despesas);
        return toResponseDTO(despesaSalva);
    }

    // LISTAR TODAS AS DESPESAS AJUSTADAS PARA RETORNAR APENAS O DTO FORMATADO
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
        Optional<Despesa> despesOptional = despesaRepository.findById(id);

        if (despesOptional.isPresent()) {
            Despesa despesas = despesOptional.get();
            return toResponseDTO(despesas);
        } else {
            throw new ResourceNotFoundException("Não existe nenhuma despesa com esse ID: " + id);
        }
    }

    public DespesaResponseDTO alterarDespesa(Long id, DespesaResponseDTO dto) {
        Optional<Despesa> alterarDespesa = despesaRepository.findById(id);

        if (alterarDespesa.isPresent()) {
            Despesa despesa = alterarDespesa.get();

            despesa.setNome(dto.getNome());
            despesa.setIsParcelado(dto.getIsParcelado());
            despesa.setDiaPagamento(dto.getDiaPagamento());
            despesa.setValorDespesa(dto.getValor());
            if (dto.getNomeCategoria() != null && !dto.getNomeCategoria().isEmpty()) {

                Optional<Categoria> categorOptional = categoriaRepository.findByNome(dto.getNomeCategoria());
                Categoria categoria;
                if (categorOptional.isPresent()) {
                    categoria = categorOptional.get();
                } else {
                    categoria = new Categoria();
                    categoria.setNome(dto.getNomeCategoria());
                    categoria = categoriaRepository.save(categoria);
                }
                despesa.setCategoria(categoria);
            }
            Despesa despesaSalva = despesaRepository.save(despesa);
            return toResponseDTO(despesaSalva);
        } else {
            throw new ResourceNotFoundException("Não existe nenhuma despesa com esse ID: " + id);
        }
    }

    public void deletarDespesaPorId(Long id) {
        if (!despesaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Não existe nenhuma despesa com esse ID: " + id);
        }
        despesaRepository.deleteById(id);
    }

    private DespesaResponseDTO toResponseDTO(Despesa despesa) {
        DespesaResponseDTO dto = new DespesaResponseDTO();
        dto.setId(despesa.getId());
        dto.setNome(despesa.getNome());
        dto.setNomeCategoria(despesa.getCategoria().getNome());
        dto.setValor(despesa.getValorDespesa());
        dto.setTipo(despesa.getTipo());

        dto.setIsParcelado(despesa.getIsParcelado());
        dto.setDiaPagamento(despesa.getDiaPagamento());
        dto.setDataRegistro(despesa.getDataRegistro());
        dto.setIdUsuario(despesa.getUsuarioDespesa().getId());
        return dto;
    }

}
