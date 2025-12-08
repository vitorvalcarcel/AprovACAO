package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosAtualizacaoConcurso;
import com.nomeacao.api.dto.DadosCadastroConcurso;
import com.nomeacao.api.dto.DadosListagemConcurso;
import com.nomeacao.api.model.Concurso;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.ConcursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConcursoService {

    @Autowired
    private ConcursoRepository repository;

    public DadosListagemConcurso cadastrar(DadosCadastroConcurso dados, Usuario usuario) {
        var concurso = new Concurso();
        concurso.setNome(dados.nome());
        concurso.setBanca(dados.banca());
        concurso.setDataProva(dados.dataProva());
        concurso.setUsuario(usuario);

        repository.save(concurso);
        return new DadosListagemConcurso(concurso);
    }

    public List<DadosListagemConcurso> listar(Usuario usuario) {
        return repository.findAllByUsuario(usuario)
                .stream()
                .map(DadosListagemConcurso::new)
                .toList();
    }

    public DadosListagemConcurso atualizar(DadosAtualizacaoConcurso dados, Usuario usuario) {
        var concurso = repository.findById(dados.id())
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        validarDono(concurso, usuario);

        concurso.atualizarInformacoes(dados.nome(), dados.banca(), dados.dataProva());
        return new DadosListagemConcurso(repository.save(concurso));
    }

    public void excluir(Long id, Usuario usuario) {
        var concurso = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        validarDono(concurso, usuario);

        repository.delete(concurso);
    }

    private void validarDono(Concurso concurso, Usuario usuario) {
        if (!concurso.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado: Este concurso não é seu!");
        }
    }
}