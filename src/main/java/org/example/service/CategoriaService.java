package org.example.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import org.example.DTO.CategoriaResponseDTO;
import org.example.exceptions.DuplicateResourceException;
import org.example.exceptions.ResourceNotFoundException;
import org.example.models.Categoria;
import org.example.models.User;
import org.example.repository.CategoriaRepository;
import org.example.repository.UsersRepository;

import jakarta.transaction.Transactional;

@Service
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;
    private final UsersRepository usersRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, UsersRepository usersRepository) {
        this.categoriaRepository = categoriaRepository;
        this.usersRepository = usersRepository;
    }

    @Transactional
    public CategoriaResponseDTO criarCategoria(CategoriaResponseDTO dto, Long usuarioId) {
        // primeiro procura pelo id do usuario
        User usuario = usersRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("user not found"));// se nao achar cai aqui

        if (categoriaRepository.findByNome(dto.getNome()).isPresent()) {
            throw new DuplicateResourceException("Já existe uma categoria com esse nome: " + dto.getNome());
        }

        Categoria novaCategoria;
        novaCategoria = new Categoria();
        novaCategoria.setNome(dto.getNome());
        novaCategoria.setUsuarioCategoria(usuario);
        Categoria salvarCategoria = categoriaRepository.save(novaCategoria);

        return toResponseDTO(salvarCategoria);
    }

    public CategoriaResponseDTO toResponseDTO(Categoria categoria) {
        CategoriaResponseDTO novo = new CategoriaResponseDTO();
        System.out.println("ID: " + categoria.getId());
        novo.setIdCategoria(categoria.getId());
        novo.setNome(categoria.getNome());
        novo.setUsuarioId(categoria.getUsuarioCategoria().getId());
        return novo;
    }
    @Transactional
    public CategoriaResponseDTO buscarId(Long id) {
        Optional<Categoria> buscarOptional = categoriaRepository.findById(id);

        if (buscarOptional.isPresent()) {
            Categoria categoria = buscarOptional.get();
            return toResponseDTO(categoria);
        } else {
            throw new ResourceNotFoundException("Não existe nenhuma categoria com esse ID: " + id);

        }
    }

    @Transactional
    public void deletarCategoriaPorId(Long id){
        if(!categoriaRepository.existsById(id)){
            throw new ResourceNotFoundException("Não existe nenhuma categoria com esse ID: " + id);
        }
        categoriaRepository.deleteById(id);

    }

    @Transactional
    public List<CategoriaResponseDTO> listarTodas(){
        List<Categoria> categoria = categoriaRepository.findAll();
        List<CategoriaResponseDTO> resultado = new ArrayList<>();
        for(Categoria categorias: categoria){
            resultado.add(toResponseDTO(categorias));
        }
        return resultado;
    }
    @Transactional
    public CategoriaResponseDTO alterarCategoria(CategoriaResponseDTO dto, Long id){
        Optional<Categoria> cateOptional = categoriaRepository.findById(id);
        Categoria categoria =  cateOptional.get();
        if(cateOptional.isPresent()){
            categoria.setNome(dto.getNome());
            categoriaRepository.save(categoria);
            return toResponseDTO(categoria);
        }else{
            throw new ResourceNotFoundException("NAO EXISTE NEHUMA CATEGORIA COM ESSE ID/ NENHUMA ENCONTRADA");
        }

    }
}
