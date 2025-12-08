package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosAtualizacaoMateria;
import com.nomeacao.api.dto.DadosCadastroMateria;
import com.nomeacao.api.dto.DadosListagemMateria;
import com.nomeacao.api.model.Materia;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.MateriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MateriaService {

    @Autowired
    private MateriaRepository repository;

    public DadosListagemMateria cadastrar(DadosCadastroMateria dados, Usuario usuario) {
        var materia = new Materia();
        materia.setNome(dados.nome());
        materia.setUsuario(usuario);
        
        repository.save(materia);
        
        return new DadosListagemMateria(materia);
    }

    public List<DadosListagemMateria> listar(Usuario usuario) {
        return repository.findAllByUsuario(usuario)
                .stream()
                .map(DadosListagemMateria::new)
                .toList();
    }

    public DadosListagemMateria atualizar(DadosAtualizacaoMateria dados, Usuario usuario) {
        var materia = repository.findById(dados.id())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        validarDono(materia, usuario);

        materia.atualizarInformacoes(dados.nome());
        return new DadosListagemMateria(repository.save(materia)); 
    }

    public void excluir(Long id, Usuario usuario) {
        var materia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        validarDono(materia, usuario);

        repository.delete(materia);
    }

    private void validarDono(Materia materia, Usuario usuario) {
        if (!materia.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado: Essa matéria não é sua!");
        }
    }
}